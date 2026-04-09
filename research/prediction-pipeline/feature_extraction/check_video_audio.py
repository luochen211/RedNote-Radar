# 检查从视频中提取的音频能不能对应上

import os
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
VIDEO_DIR = BASE_DIR / "icon_data" / "raw-videos"
FRAME_DIR = BASE_DIR / "icon_data" / "keyframes"

video_list = [p.name for p in VIDEO_DIR.glob("*.mp4")]
frame_list = {p.name for p in FRAME_DIR.iterdir() if p.is_dir()}

for video in video_list:
    if video[:-4] not in frame_list:
        print(video)
