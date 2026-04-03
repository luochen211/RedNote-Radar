70import os
import random
import time

import torch
import torchvision.transforms as transforms
from torchvision import models
from torch.utils.data import DataLoader
from PIL import Image
import pickle
import numpy as np
from tqdm import tqdm

import warnings
warnings.filterwarnings("ignore")


def extract_and_save_features(input_folder, output_folder, interval=0):
    # 使用预训练的VGG19模型
    model = models.vgg19(pretrained=True)
    # 删除最后一层分类器
    # model = torch.nn.Sequential(*list(model.children()))
    model.eval()  # 设置为评估模式
    # 定义图像变换
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    output_file = os.listdir(output_folder)

    # 遍历视频文件夹中的所有二级文件夹
    for subdir in tqdm(os.listdir(input_folder)):
        subdir_path = os.path.join(input_folder, subdir)
        if os.path.isdir(subdir_path):
            feature_list = []
            if subdir + '.pkl' in output_file:    #如果已经提取过特征，跳过
                continue
            total_frames = len(os.listdir(subdir_path))
            frames_list = os.listdir(subdir_path)
            idx = 0
            while idx+1 <= total_frames:
                filename = frames_list[idx]
                # 遍历二级文件夹中的所有图像文件
                if filename.endswith(".jpg"):
                    img_path = os.path.join(subdir_path, filename)
                    img = Image.open(img_path).convert("RGB")
                    img = transform(img).unsqueeze(0)  # 添加批次维度

                    # 提取特征
                    with torch.no_grad():
                        a = model.features(img)  # 使用feature获取特征层（卷积层）的特征；输出特征维度为【1，512，4，4】
                        b = model.avgpool(a)  # 使用vgg定义的池化操作；输出特征维度为【1，512，7，7】
                        b = torch.flatten(b, 1)  # 将特征变成一维度；输出特征维度为【1，25088】
                        features = model.classifier[:-1](b)  # 使用分类层的的第一层，当然可以选择数；输出特征维度为【1，4096】

                        # features = model(img) (1,1000)

                    feature_list.append(features.squeeze().numpy())

                idx += interval+1

            # 将特征列表保存为Pickle文件
            output_file = os.path.join(output_folder, f"{subdir}.pkl")
            with open(output_file, "wb") as f:
                pickle.dump(feature_list, f)




# # error file
# ERROR_FILE = r'F:\mj\polyuproject\mmvideo\szz_featureextraction\1.差分提取视频关键帧\空视频帧文件夹.txt'

# 创建输出文件夹（如果不存在）
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# 开始时间
start_time = time.time()
# 提取并保存特征
extract_and_save_features(input_folder, output_folder)

# 结束时间
end_time = time.time()

# 输出用时
print(f"Time elapsed: {end_time - start_time} seconds.")
