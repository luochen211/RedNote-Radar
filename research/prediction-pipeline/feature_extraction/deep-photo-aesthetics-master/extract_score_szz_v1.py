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
# %matplotlib inline
# sys.path.append("..")



# 根据jasion 找 all_image
# 先debug 100张图片 再找完整的8w张
# extract——score是原稿参考
# 需要将comment id 一起写道dict中
# 求一条评论所有图像的均值
# 若一条评论图像有1K个会 outofmemery，只取前10张，若没有OOM全部取出

use_cuda = torch.cuda.is_available()

from model.resnet_FT import ResNetGAPFeatures as Net
from utils.data import read_data, create_dataloader, AestheticsDataset
save_path = "./checkpoint"
checkpoint = "epoch_19.loss_0.39017042717409517.pth"
resnet = models.resnet50(pretrained=True)
net = Net(resnet, n_features=12)
if use_cuda:
    resnet = resnet.cuda()
    net = net.cuda()
    net.load_state_dict(torch.load(f"{save_path}/{checkpoint}"))
else:
    net.load_state_dict(torch.load(f"{save_path}/{checkpoint}", map_location=lambda storage, loc: storage))

attr_keys = ['BalacingElements', 'ColorHarmony', 'Content', 'DoF', 'Light', 'MotionBlur', 'Object', 'RuleOfThirds', 'VividColor']
non_neg_attr_keys = ['Repetition', 'Symmetry', 'score']
all_keys = attr_keys + non_neg_attr_keys

def extract_prediction(output, net):
    d = dict()
    net.eval()

    for i, key in enumerate(all_keys):
        d[key] = output[:, i].squeeze()
    return d



#---------------------------------------my code below---------------------------------------#
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
    try:
        im = mpimg.imread(img_path)
        img = transform(im)

    except:
        im = np.random.randn(512,512,3).astype('uint8')
        img = transform(im)

    img = Variable(img).unsqueeze(0)
    return img



# img_path = "../icon_data/raw-images"
# # img_path = './images'
# img_list = os.listdir(img_path)
#
# # total_json = total_json[:5]
# new_json = {}
# for i_img in tqdm(img_list):
#     i_img_ = img_pro(img_path + i_img)
#     if use_cuda:
#         i_img_ = i_img_.cuda()
#     with torch.no_grad():
#         many_value = net(i_img_)
#     row_data = extract_prediction(many_value, net)
#     i_img_score = row_data['score'].to('cpu').item()
#     new_json[i_img] = i_img_score
#
# with open('icon_cover_img.json', 'w') as f: # {文件名：分数}
#     json.dump(new_json, f)


if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    base_img_dir = script_dir.parent / "icon_data" / "raw-images"
    json_path = script_dir.parent.parent / "text_image_features" / "icon_data_feature.json"
    output_json = script_dir / "icon_data_with_aesthetic.json"

    # 1. 读取原始JSON文件
    with open(json_path, 'r', encoding='utf-8') as f:
        video_data = json.load(f)  # 假设是字典列表

    # 2. 处理每个视频条目
    for item in tqdm(video_data, desc="Processing cover images"):
        # 获取封面图片路径
        cover_path = item["cover"]

        # 从"./img/xxx.jpg"提取文件名
        filename = os.path.basename(cover_path)

        # 构建完整图片路径
        full_img_path = base_img_dir / filename

        # 3. 检查图片是否存在
        if not full_img_path.exists():
            print(f"Warning: Image not found - {full_img_path}")
            item["img_aesthetics"] = None
            continue

        # 4. 处理图片并预测分数
        try:
            img_tensor = img_pro(str(full_img_path))
            if use_cuda:
                img_tensor = img_tensor.cuda()

            with torch.no_grad():
                features = net(img_tensor)

            # 提取预测分数（假设extract_prediction函数已定义）
            result = extract_prediction(features, net)
            score = result['score'].cpu().item()
            item["img_aesthetics"] = score

        except Exception as e:
            print(f"Error processing {full_img_path}: {str(e)}")
            item["img_aesthetics"] = None

    # 5. 保存包含美学分数的新JSON文件
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(video_data, f, ensure_ascii=False, indent=2)

    print(f"处理完成! 结果已保存至: {output_json}")



