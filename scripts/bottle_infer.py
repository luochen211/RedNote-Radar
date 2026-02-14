#!/usr/bin/env python3
import io
import json
import math
import os
import re
import sys
import warnings
import contextlib
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Tuple

import cv2
import imageio_ffmpeg
import numpy as np
import torch
import torch.nn as nn
from torch import Tensor

warnings.filterwarnings("ignore")


ROOT = Path(__file__).resolve().parents[1]
MODEL_CODE_ROOT = ROOT / "网页代码/1.预测页代码与部分分析页代码/weight/code"
BERT_DIR = ROOT / "网页代码/1.预测页代码与部分分析页代码/weight/bert"
CHECKPOINT_ALL = MODEL_CODE_ROOT / "checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_all29_bs1.pth"
CHECKPOINT_ICON = MODEL_CODE_ROOT / "checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_icon0_bs1_new.pth"

os.environ.setdefault("HF_HOME", str(ROOT / ".cache/huggingface"))
os.environ.setdefault("TRANSFORMERS_CACHE", str(ROOT / ".cache/huggingface/transformers"))

sys.path.insert(0, str(MODEL_CODE_ROOT))
sys.path.insert(0, str(MODEL_CODE_ROOT / "torchvggish"))

from transformers import AutoTokenizer, BertModel  # noqa: E402
from models.coattention import co_attention  # noqa: E402
import torchvggish.vggish_input as vggish_input  # noqa: E402

# Suppress prints from optional imports inside models.SVFEND.
with contextlib.redirect_stdout(io.StringIO()):
    from models.SVFEND import AudioFormer, FactorAtt, VideoFormer  # noqa: E402


POSITIVE_WORDS = {"luxury", "elegant", "premium", "amazing", "beautiful", "great", "excellent", "best",
                  "喜欢", "推荐", "高端", "舒适", "奢华", "精致", "治愈", "惊艳", "值得", "放松", "体验"}
NEGATIVE_WORDS = {"bad", "poor", "worse", "worst", "boring", "noisy", "crowded",
                  "差", "一般", "失望", "拥挤", "吵", "糟糕", "问题", "不推荐"}


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        n = float(value)
    except Exception:
        return default
    if math.isfinite(n):
        return n
    return default


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9\u4e00-\u9fff]+", text.lower())


def jaccard(a: List[str], b: List[str]) -> float:
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    union = len(sa | sb)
    return inter / union if union else 0.0


def sentiment_score(text: str) -> float:
    t = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in t)
    neg = sum(1 for w in NEGATIVE_WORDS if w in t)
    if pos == 0 and neg == 0:
        return 0.5
    return clamp((pos - neg) / (pos + neg) * 0.5 + 0.5, 0.0, 1.0)


def lexical_readability(text: str) -> float:
    tokens = tokenize(text)
    if not tokens:
        return 0.35
    diversity = len(set(tokens)) / len(tokens)
    length_penalty = max(0.0, (len(text) - 260.0) / 900.0)
    return clamp(0.72 + diversity * 0.25 - length_penalty, 0.0, 1.0)


def parse_tags(raw_tags: Any) -> List[str]:
    if isinstance(raw_tags, list):
        return [str(x).strip() for x in raw_tags if str(x).strip()]
    if isinstance(raw_tags, str):
        return [x.strip() for x in re.split(r"[,;，；]", raw_tags) if x.strip()]
    return []


def frame_to_4096(frame_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (64, 64), interpolation=cv2.INTER_AREA)
    feat = gray.astype(np.float32).reshape(-1) / 255.0
    return feat


def normalize_sequence(features: np.ndarray, target_len: int, feature_dim: int) -> np.ndarray:
    if features.size == 0:
        return np.zeros((target_len, feature_dim), dtype=np.float32)

    cur_len = int(features.shape[0])
    if cur_len >= target_len:
        idx = np.linspace(0, cur_len - 1, num=target_len).astype(int)
        return features[idx].astype(np.float32)

    pad = np.zeros((target_len - cur_len, feature_dim), dtype=np.float32)
    return np.concatenate([features.astype(np.float32), pad], axis=0)


def sample_video_frames(video_path: str, max_frames: int = 83) -> List[np.ndarray]:
    if not video_path or not Path(video_path).exists():
        return []

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sampled: List[np.ndarray] = []

    if total_frames > 0:
        target = min(total_frames, max_frames)
        indices = np.linspace(0, max(total_frames - 1, 0), num=target).astype(int)
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ok, frame = cap.read()
            if ok and frame is not None:
                sampled.append(frame_to_4096(frame))
    else:
        step = 0
        while len(sampled) < max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if step % 3 == 0:
                sampled.append(frame_to_4096(frame))
            step += 1

    cap.release()
    return sampled


def build_video_feature(video_path: str, cover_path: str) -> np.ndarray:
    sampled = sample_video_frames(video_path, max_frames=83)
    if sampled:
        return normalize_sequence(np.stack(sampled).astype(np.float32), target_len=83, feature_dim=4096)

    if cover_path and Path(cover_path).exists():
        cover = cv2.imread(cover_path)
        if cover is not None:
            feat = frame_to_4096(cover)
            return normalize_sequence(np.stack([feat]).astype(np.float32), target_len=83, feature_dim=4096)

    return np.zeros((83, 4096), dtype=np.float32)


def compute_cover_metrics(cover_path: str) -> Tuple[float, float, float]:
    if not cover_path or not Path(cover_path).exists():
        return 4.0, 0.5, 0.0

    img = cv2.imread(cover_path)
    if img is None:
        return 4.0, 0.5, 0.0

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray)) / 255.0
    contrast = float(np.std(gray)) / 64.0
    channels = cv2.split(img.astype(np.float32))
    rg = np.abs(channels[2] - channels[1])
    yb = np.abs(0.5 * (channels[2] + channels[1]) - channels[0])
    colorfulness = float(np.mean(np.sqrt(rg ** 2 + yb ** 2))) / 100.0

    # Map to model factor ranges.
    img_quality_0_10 = clamp(blur_var / 130.0 + brightness * 4.0, 0.0, 1.0) * 10.0
    aesthetics_0_1 = clamp(colorfulness * 0.45 + contrast * 0.35 + brightness * 0.2, 0.0, 1.0)

    face_num = 0.0
    try:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        classifier = cv2.CascadeClassifier(cascade_path)
        faces = classifier.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        face_num = float(len(faces))
    except Exception:
        face_num = 0.0

    return img_quality_0_10, aesthetics_0_1, face_num


def extract_audio_wav(video_path: str, wav_path: Path) -> bool:
    if not video_path or not Path(video_path).exists():
        return False
    try:
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [
            ffmpeg,
            "-y",
            "-i",
            video_path,
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-f",
            "wav",
            str(wav_path),
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        return proc.returncode == 0 and wav_path.exists() and wav_path.stat().st_size > 0
    except Exception:
        return False


def build_audio_feature(video_path: str, model: "BottleInferenceModel") -> np.ndarray:
    # Fallback path if extraction fails.
    fallback = np.zeros((50, 12288), dtype=np.float32)
    if not video_path:
        return fallback

    try:
        with tempfile.TemporaryDirectory(prefix="hotel-forecast-audio-") as td:
            wav_path = Path(td) / "audio.wav"
            if not extract_audio_wav(video_path, wav_path):
                return fallback

            examples = vggish_input.wavfile_to_examples(str(wav_path), return_tensor=True)
            if not isinstance(examples, torch.Tensor) or examples.ndim != 4 or examples.shape[0] == 0:
                return fallback

            with torch.no_grad():
                conv = model.vggish_layer.features(examples.float())
                conv = torch.transpose(conv, 1, 3)
                conv = torch.transpose(conv, 1, 2)
                conv = conv.contiguous().view(conv.size(0), -1)

            feats = conv.detach().cpu().numpy().astype(np.float32)
            return normalize_sequence(feats, target_len=50, feature_dim=12288)
    except Exception:
        return fallback


class PProcStub(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.pca_eigen_vectors = nn.Parameter(torch.zeros((128, 128), dtype=torch.float32), requires_grad=False)
        self.pca_means = nn.Parameter(torch.zeros((128, 1), dtype=torch.float32), requires_grad=False)


def make_vggish_layers() -> nn.Sequential:
    layers: List[nn.Module] = []
    in_channels = 1
    for v in [64, "M", 128, "M", 256, 256, "M", 512, 512, "M"]:
        if v == "M":
            layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
        else:
            layers.append(nn.Conv2d(in_channels, int(v), kernel_size=3, padding=1))
            layers.append(nn.ReLU(inplace=True))
            in_channels = int(v)
    return nn.Sequential(*layers)


class VggishStub(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.features = make_vggish_layers()
        self.embeddings = nn.Sequential(
            nn.Linear(512 * 4 * 6, 4096),
            nn.ReLU(True),
            nn.Linear(4096, 4096),
            nn.ReLU(True),
            nn.Linear(4096, 128),
            nn.ReLU(True),
        )
        self.pproc = PProcStub()


class BottleInferenceModel(nn.Module):
    def __init__(self, args: Dict[str, Any], bert_path: str) -> None:
        super().__init__()
        self.args = args
        self.bert = BertModel.from_pretrained(bert_path).requires_grad_(False)

        self.fusion_weight = nn.Parameter(torch.ones(3))

        self.visual = VideoFormer(
            width=args["multifea_dim"],
            layers=args["temporal_layers"],
            heads=args["temporal_heads"],
            output_dim=args["multifea_dim"],
            droppath=None,
            T=args["num_videoframes"],
            use_checkpoint=False,
            config=args,
        )
        self.acoustic = AudioFormer(
            width=args["multifea_dim"],
            layers=args["temporal_layers"],
            heads=args["temporal_heads"],
            output_dim=args["multifea_dim"],
            droppath=None,
            T=args["num_audioframes"],
            use_checkpoint=False,
            config=args,
        )
        self.text_attention = nn.TransformerEncoderLayer(
            d_model=args["multifea_dim"],
            nhead=args["text_att_n_head"],
            batch_first=True,
        )
        self.multi_factoratt = FactorAtt(args)

        self.text_dim = args["text_dim"]
        self.img_dim = args["img_dim"]
        self.num_frames = args["num_videoframes"]
        self.num_audioframes = args["num_audioframes"]
        self.dim = args["multifea_dim"]
        self.num_heads = args["coattnum_heads"]
        self.dropout = args["dropout"]

        self.vggish_layer = VggishStub()
        self.vggish_modified = nn.Sequential(self.vggish_layer.embeddings)

        self.co_attention_ta = co_attention(
            d_k=self.dim,
            d_v=self.dim,
            n_heads=self.num_heads,
            dropout=self.dropout,
            d_model=self.dim,
            visual_len=self.num_audioframes,
            sen_len=512,
            fea_v=self.dim,
            fea_s=self.dim,
            pos=False,
        )
        self.co_attention_tv = co_attention(
            d_k=self.dim,
            d_v=self.dim,
            n_heads=self.num_heads,
            dropout=self.dropout,
            d_model=self.dim,
            visual_len=self.num_frames,
            sen_len=512,
            fea_v=self.dim,
            fea_s=self.dim,
            pos=False,
        )

        self.linear_text = nn.Sequential(nn.Linear(self.text_dim, self.dim))
        self.linear_img = nn.Sequential(nn.Linear(self.img_dim, self.dim))
        self.linear_audio = nn.Sequential(nn.Linear(self.dim, self.dim))

        self.predictor = nn.Sequential(
            nn.Linear(self.dim, self.dim),
            nn.ReLU(),
            nn.Dropout(p=self.dropout),
            nn.Linear(self.dim, 1),
        )

    def forward(self, **kwargs: Tensor) -> Tensor:
        txt_inputid = kwargs["txt_inputid"]
        txt_mask = kwargs["txt_mask"]
        fea_text = self.bert(txt_inputid, attention_mask=txt_mask)["last_hidden_state"]
        fea_text = self.linear_text(fea_text)

        audioframes = kwargs["audio_feature"]
        fea_audio = self.vggish_modified(audioframes)
        fea_audio = self.linear_audio(fea_audio)

        frames = kwargs["video_feature"]
        fea_img = self.linear_img(frames)

        fea_img = self.visual(fea_img)
        fea_audio = self.acoustic(fea_audio)
        fea_text = self.text_attention(fea_text)

        fea_audio, fea_text = self.co_attention_ta(v=fea_audio, s=fea_text, v_len=fea_audio.shape[1], s_len=fea_text.shape[1])
        fea_img, fea_text = self.co_attention_tv(v=fea_img, s=fea_text, v_len=fea_img.shape[1], s_len=fea_text.shape[1])

        fea_text = torch.mean(fea_text, -2)
        fea_audio = torch.mean(fea_audio, -2)
        fea_img = torch.mean(fea_img, -2)

        w_txt, w_audio, w_img = torch.nn.functional.softmax(self.fusion_weight, dim=0)
        fea_multi = w_txt * fea_text + w_audio * fea_audio + w_img * fea_img

        fea_multi = self.multi_factoratt(fea_multi, kwargs)
        return self.predictor(fea_multi)


def default_args() -> Dict[str, Any]:
    return {
        "text_dim": 768,
        "comment_dim": 768,
        "img_dim": 4096,
        "video_dim": 4096,
        "num_videoframes": 83,
        "num_audioframes": 50,
        "num_comments": 23,
        "multifea_dim": 128,
        "coattnum_heads": 1,
        "txt_length": 128,
        "text_att_n_head": 1,
        "predict_size": 1,
        "follows": 1.0,
        "subscribers": 1.0,
        "praises": 1.0,
        "ttsimilarity": 1.0,
        "numtags": 1.0,
        "itsimilarity": 1.0,
        "readability": 1.0,
        "imgquality": 1.0,
        "titlesentiment": 1.0,
        "imgaesthetics": 1.0,
        "face": 1.0,
        "bottleneck_head_num": 1,
        "bottleneck_layer_num": 1,
        "bottleneck_len": 20,
        "temporal_layers": 1,
        "temporal_heads": 1,
        "dropout": 0.1,
        "train_scope": "all",
    }


def adjust_global(x: float) -> float:
    x_adjusted = x * 1000.0
    if x_adjusted < 0:
        x_adjusted = -x_adjusted
    if x_adjusted > 95:
        x_adjusted = ((x_adjusted - 17.5) / x_adjusted) * 100.0
    return float(clamp(x_adjusted, 0.0, 100.0))


def adjust_local(x: float) -> float:
    if x < 0:
        return float(clamp(-100.0 * x, 0.0, 100.0))
    if 0 < x < 1:
        return float(clamp(x * 100.0, 0.0, 100.0))
    if 1 <= x < 10:
        return float(clamp((x / (x + 0.5)) * 100.0, 0.0, 100.0))
    if x >= 10:
        return float(clamp((x / (x + 5.0)) * 100.0, 0.0, 100.0))
    return float(clamp(x, 0.0, 100.0))


def to_tensor_dict(
    payload: Dict[str, Any],
    tokenizer: AutoTokenizer,
    audio_feature: np.ndarray,
) -> Tuple[Dict[str, Tensor], Dict[str, int]]:
    title = str(payload.get("title") or "").strip()
    text_content = str(payload.get("textContent") or "").strip()
    tags = parse_tags(payload.get("tags"))
    text_joined = " ".join([title, text_content, " ".join(tags)]).strip()

    tokenized = tokenizer(
        text_joined,
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
    )

    video_path = str(payload.get("videoStoredPath") or "")
    cover_path = str(payload.get("coverStoredPath") or "")
    video_feature = build_video_feature(video_path, cover_path)

    title_tokens = tokenize(title)
    text_tokens = tokenize(text_content)
    tag_tokens = tokenize(" ".join(tags))

    follows = safe_float(payload.get("followers"), 0.0)
    subscribers = safe_float(payload.get("subscribers"), 0.0)
    praises = safe_float(payload.get("likes"), 0.0)

    readability = lexical_readability(text_joined)
    title_sentiment = sentiment_score(title or text_content)
    ttsimilarity = jaccard(title_tokens, text_tokens if text_tokens else tag_tokens)

    imgquality, imgaesthetics, facenum = compute_cover_metrics(cover_path)
    itsimilarity = clamp(0.6 * jaccard(title_tokens, tag_tokens) + 0.4 * (imgquality / 10.0), 0.0, 1.0)

    data: Dict[str, Tensor] = {
        "txt_inputid": tokenized["input_ids"].long(),
        "txt_mask": tokenized["attention_mask"].long(),
        "video_feature": torch.tensor(video_feature, dtype=torch.float32).unsqueeze(0),
        "audio_feature": torch.tensor(audio_feature, dtype=torch.float32).unsqueeze(0),
        "follows": torch.tensor([follows], dtype=torch.float32),
        "subscribers": torch.tensor([subscribers], dtype=torch.float32),
        "praises": torch.tensor([praises], dtype=torch.float32),
        "favors": torch.tensor([0.0], dtype=torch.float32),
        "comments": torch.tensor([0.0], dtype=torch.float32),
        "shares": torch.tensor([0.0], dtype=torch.float32),
        "ttsimilarity": torch.tensor([ttsimilarity], dtype=torch.float32),
        "numtags": torch.tensor([float(len(tags))], dtype=torch.float32),
        "itsimilarity": torch.tensor([itsimilarity], dtype=torch.float32),
        "readability": torch.tensor([readability], dtype=torch.float32),
        "imgquality": torch.tensor([imgquality], dtype=torch.float32),
        "titlesentiment": torch.tensor([title_sentiment], dtype=torch.float32),
        "imgaesthetics": torch.tensor([imgaesthetics], dtype=torch.float32),
        "facenum": torch.tensor([facenum], dtype=torch.float32),
        "max_value_dict": {
            "follows": 10000.0,
            "subscribers": 10000.0,
            "praises": 50000.0,
            "ttsimilarity": 1.0,
            "numtags": 20.0,
            "itsimilarity": 1.0,
            "readability": 1.0,
            "imgquality": 10.0,
            "titlesentiment": 1.0,
            "imgaesthetics": 1.0,
        },
    }
    dimensions = {
        "textTokens": int(data["txt_inputid"].shape[-1]),
        "videoFrames": int(data["video_feature"].shape[1]),
        "videoFeatureDim": int(data["video_feature"].shape[2]),
        "audioFrames": int(data["audio_feature"].shape[1]),
        "audioFeatureDim": int(data["audio_feature"].shape[2]),
    }
    return data, dimensions


def load_model(args: Dict[str, Any]) -> BottleInferenceModel:
    model = BottleInferenceModel(args=args, bert_path=str(BERT_DIR))
    model.eval()
    return model


def load_checkpoint_strict(model: BottleInferenceModel, checkpoint: Path) -> None:
    state = torch.load(checkpoint, map_location="cpu")
    missing, unexpected = model.load_state_dict(state, strict=False)
    if missing or unexpected:
        raise RuntimeError(
            f"Checkpoint mismatch for {checkpoint.name}; missing={len(missing)}, unexpected={len(unexpected)}"
        )


class InferenceRuntime:
    def __init__(self) -> None:
        if not CHECKPOINT_ALL.exists() or not CHECKPOINT_ICON.exists():
            raise FileNotFoundError("Model checkpoint file is missing.")
        if not BERT_DIR.exists():
            raise FileNotFoundError("BERT directory is missing.")

        self.tokenizer = AutoTokenizer.from_pretrained(str(BERT_DIR), local_files_only=True)
        args = default_args()

        self.model_global = load_model(args)
        self.model_local = load_model(args)

        load_checkpoint_strict(self.model_global, CHECKPOINT_ALL)
        load_checkpoint_strict(self.model_local, CHECKPOINT_ICON)

        self.model_global.eval()
        self.model_local.eval()

    def infer(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        video_path = str(payload.get("videoStoredPath") or "")
        audio_feature = build_audio_feature(video_path, self.model_global)
        batch, input_dims = to_tensor_dict(payload, self.tokenizer, audio_feature)

        with torch.no_grad():
            raw_global = float(self.model_global(**batch).view(-1).item())
            raw_local = float(self.model_local(**batch).view(-1).item())

        return {
            "modelVersion": "bottle-checkpoint-v2",
            "engagementScore": {
                "local": int(round(adjust_local(raw_local))),
                "global": int(round(adjust_global(raw_global))),
            },
            "raw": {
                "local": raw_local,
                "global": raw_global,
            },
            "testDimensions": {
                "input": input_dims,
                "output": {
                    "rawLocal": raw_local,
                    "rawGlobal": raw_global,
                },
            },
        }


def run_once() -> None:
    if not CHECKPOINT_ALL.exists() or not CHECKPOINT_ICON.exists():
        raise FileNotFoundError("Model checkpoint file is missing.")
    if not BERT_DIR.exists():
        raise FileNotFoundError("BERT directory is missing.")

    raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("Expected JSON payload from stdin.")
    payload = json.loads(raw)

    runtime = InferenceRuntime()
    result = runtime.infer(payload)
    sys.stdout.write(json.dumps(result, ensure_ascii=False))


def serve() -> None:
    runtime = InferenceRuntime()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        request_id = ""
        try:
            message = json.loads(line)
            request_id = str(message.get("requestId") or "")
            payload = message.get("payload")
            if not isinstance(payload, dict):
                raise ValueError("payload must be an object")

            result = runtime.infer(payload)
            out = {"requestId": request_id, "ok": True, "result": result}
        except Exception as exc:
            out = {"requestId": request_id, "ok": False, "error": str(exc)}

        sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    try:
        if "--serve" in sys.argv:
            serve()
        else:
            run_once()
    except Exception as exc:
        err = {"error": str(exc)}
        sys.stdout.write(json.dumps(err, ensure_ascii=False))
        sys.exit(1)
