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
from torchvision import models, transforms
from collections import OrderedDict
from tqdm import tqdm
import pprint
import cv2
import random
import torch
import sys
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



train = read_data("./data/train.csv", "./images")


save_path = "./checkpoint"
checkpoint = "epoch_17.loss_0.39351042473923425.pth"
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

train_dataset = AestheticsDataset(train, is_train=False)

from tqdm import tqdm
df_train_data = []
count_total=0
for train_data in tqdm(train_dataset):
    if count_total>10:
        break
    # image below should be my image
    image = train_data['image']
    image_path = train_data['image_path']
    inp = Variable(image).unsqueeze(0)
    if use_cuda:
        inp = inp.cuda()
    # output = net(inp).squeeze().data
    with torch.no_grad():
        output = net(inp)
    row_data = extract_prediction(output, net)
    row_data['img_path'] = image_path
    df_train_data.append(row_data)
    count_total+=1

#score and comment id
aesthe_score=[]
comment_id=[]

for i in range(len(df_train_data)):
    aesthe_score.append(df_train_data[i]["score"])
    comment_id.append(df_train_data[i]["commentid"])



aa=1

count_total=0







