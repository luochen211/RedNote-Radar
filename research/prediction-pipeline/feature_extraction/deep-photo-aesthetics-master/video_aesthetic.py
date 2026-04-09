import json
import numpy as np
import pandas as pd
import os
from torch.utils.data import DataLoader, Dataset
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import numpy as np
import torch.nn as nn
from torch.autograd import Variable
import torch.nn.functional as F
from torchvision import models
from collections import OrderedDict
from tqdm import tqdm
import pprint
import cv2
import random
import torch
import sys
from pathlib import Path
from torchvision import transforms
import matplotlib.image as mpimg

# 设置是否使用GPU
use_cuda = torch.cuda.is_available()

# 导入模型（确保你的模型路径正确）
from model.resnet_FT import ResNetGAPFeatures as Net
from utils.data import read_data, create_dataloader, AestheticsDataset

# 模型加载配置
save_path = "./checkpoint"
checkpoint = "epoch_19.loss_0.39017042717409517.pth"
resnet = models.resnet50(pretrained=True)
net = Net(resnet, n_features=12)

# 加载预训练模型权重
if use_cuda:
    resnet = resnet.cuda()
    net = net.cuda()
    net.load_state_dict(torch.load(f"{save_path}/{checkpoint}"))
else:
    net.load_state_dict(torch.load(f"{save_path}/{checkpoint}", map_location=lambda storage, loc: storage))

# 美学属性键定义
attr_keys = ['BalacingElements', 'ColorHarmony', 'Content', 'DoF', 'Light', 'MotionBlur', 'Object', 'RuleOfThirds',
             'VividColor']
non_neg_attr_keys = ['Repetition', 'Symmetry', 'score']
all_keys = attr_keys + non_neg_attr_keys


def extract_prediction(output, net):
    """提取模型预测结果，返回包含各属性的字典"""
    d = dict()
    net.eval()

    for i, key in enumerate(all_keys):
        d[key] = output[:, i].squeeze()
    return d


# 图像预处理管道
normalize_transform = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
)
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize([299, 299]),
    transforms.ToTensor(),
    normalize_transform
])


def img_pro(img_path):
    """
    图像预处理函数：读取图片并转换为模型输入的tensor格式
    异常处理：读取失败时返回随机生成的图片tensor
    """
    try:
        # 读取图片（兼容中文路径）
        im = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)  # 转换为RGB格式
        img = transform(im)
    except Exception as e:
        # 读取失败时生成随机图片
        im = np.random.randn(512, 512, 3).astype('uint8')
        img = transform(im)

    img = Variable(img).unsqueeze(0)  # 添加batch维度
    return img


def calculate_average_score(video_id, base_img_dir, max_images=10):
    """
    计算单个视频所有关键帧图片的平均美学分数
    :param video_id: 视频ID（对应文件夹名称）
    :param base_img_dir: 关键帧根目录
    :param max_images: 最大处理图片数（防止OOM）
    :return: 平均分数（None表示无有效图片）
    """
    # 构建视频对应的关键帧文件夹路径
    video_frame_dir = os.path.join(base_img_dir, str(video_id))

    # 检查文件夹是否存在
    if not os.path.exists(video_frame_dir):
        print(f"Warning: Video frame directory not found - {video_frame_dir}")
        return None

    # 获取文件夹内所有图片文件（过滤常见图片格式）
    img_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
    img_files = [f for f in os.listdir(video_frame_dir)
                 if os.path.splitext(f)[1].lower() in img_extensions]

    # 无图片的情况
    if not img_files:
        print(f"Warning: No images found in {video_frame_dir}")
        return None

    # 限制处理的图片数量（防止OOM）
    img_files = img_files[:max_images]
    scores = []

    # 处理每张图片
    for img_file in img_files:
        full_img_path = os.path.join(video_frame_dir, img_file)
        try:
            # 预处理图片
            img_tensor = img_pro(full_img_path)
            if use_cuda:
                img_tensor = img_tensor.cuda()

            # 模型预测（关闭梯度计算）
            with torch.no_grad():
                features = net(img_tensor)

            # 提取分数
            result = extract_prediction(features, net)
            score = result['score'].cpu().item()
            scores.append(score)

        except Exception as e:
            print(f"Error processing {full_img_path}: {str(e)}")
            continue

    # 计算平均分（有有效分数的情况）
    if scores:
        avg_score = np.mean(scores)
        return round(avg_score, 4)  # 保留4位小数
    else:
        return None


if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    base_img_dir = script_dir.parent / "icon_data" / "keyframes"
    json_path = script_dir.parent.parent / "text_image_features" / "icon_data_feature.json"
    output_json = script_dir / "icon_data_with_video_aesthetic.json"

    # 1. 读取原始JSON文件
    print("Reading original JSON file...")
    with open(json_path, 'r', encoding='utf-8') as f:
        video_data = json.load(f)  # 假设是字典列表，每个字典包含video_id字段

    # 2. 处理每个视频条目
    print("Processing videos...")
    for item in tqdm(video_data, desc="Calculating average aesthetic scores"):
        # 获取video_id（确保字段名正确）
        video_id = item.get("video_id")
        if not video_id:
            print(f"Warning: Missing video_id in item {item}")
            item["video_aesthetic"] = None
            continue

        # 计算该视频的平均美学分数（最多取前10张图片）
        avg_score = calculate_average_score(video_id, base_img_dir, max_images=10)
        item["video_aesthetic"] = avg_score

    # 3. 保存包含平均美学分数的新JSON文件
    print(f"Saving results to {output_json}...")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(video_data, f, ensure_ascii=False, indent=2)

    print("Processing completed!")
    # 统计处理结果
    total = len(video_data)
    success = sum(1 for item in video_data if item["video_aesthetic"] is not None)
    print(f"Total videos: {total}, Successfully processed: {success}, Failed: {total - success}")
