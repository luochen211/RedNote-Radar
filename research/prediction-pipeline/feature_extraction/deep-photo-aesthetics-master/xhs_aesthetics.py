import json
import os

import pandas as pd
from matplotlib import image as mpimg
from scipy.stats import pearsonr
from tqdm import tqdm
from pathlib import Path
import argparse
from collections import defaultdict
from utils.data import read_data, create_dataloader
from model.resnet_FT import resnet_gap_features
from utils.cuda import cudarize
import torch
import torch.nn as nn
from torch.autograd import Variable

def setup_model(use_cuda):
    model = resnet_gap_features()
    model = cudarize(model, use_cuda)
    return model


parser = argparse.ArgumentParser()
parser.add_argument("--config_file_path", default="config.json")
opts = parser.parse_args()
with open(opts.config_file_path, "r") as fp:
    config = json.load(fp)

model = setup_model(config['use_cuda'])
model.load_state_dict(torch.load(config['model_path']))


images_path = 'images/'
images_list = os.listdir(images_path)

for image in images_list:
    img_path = images_path + image
    img = mpimg.imread(img_path)
    img = torch.from_numpy(img).float()
    img = img.permute(2, 0, 1)
    img = img.unsqueeze(0)
    img = cudarize(Variable(img), config['use_cuda'])
    features = model(img)
    print(f"Features for image {image}: {features}")
