import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from PIL import Image
import json
import numpy as np


# 数据处理和加载
def load_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data


# 图像预处理
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def preprocess_image(image_path):
    image = Image.open(image_path).convert('RGB')
    image = transform(image)
    return image.unsqueeze(0)  # Add batch dimension


# 定义模型
class LikesPredictor(nn.Module):
    def __init__(self):
        super(LikesPredictor, self).__init__()
        # 使用预训练的 VGG 模型（VGG16）
        self.vgg = models.vgg16(pretrained=True)
        self.vgg.classifier[6] = nn.Linear(4096, 1)  # 修改最后一层以输出一个值

    def forward(self, x):
        return self.vgg(x)


# 自定义损失函数
def compute_losses(y_true, y_pred):
    y_true = torch.tensor(y_true, dtype=torch.float32)
    y_pred = torch.tensor(y_pred, dtype=torch.float32)

    # MSE
    mse_loss = nn.MSELoss()(y_pred, y_true)
    # MAE
    mae_loss = nn.L1Loss()(y_pred, y_true)
    # RMSE
    rmse_loss = torch.sqrt(mse_loss)
    # MAPE
    mape_loss = torch.mean(torch.abs((y_true - y_pred) / y_true)) * 100
    # R^2 Score
    ss_res = torch.sum((y_true - y_pred) ** 2)
    ss_tot = torch.sum((y_true - torch.mean(y_true)) ** 2)
    r2 = 1 - ss_res / ss_tot

    return mse_loss.item(), mae_loss.item(), rmse_loss.item(), mape_loss.item(), r2.item()


# 加载数据并训练模型
def train_model(data_path, num_epochs=10, lr=1e-4):
    data = load_data(data_path)
    model = LikesPredictor().to('cuda')
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    y_true_all, y_pred_all = [], []

    for epoch in range(num_epochs):
        epoch_loss = 0
        for item in data:
            try:
                likes = float(item["likes"])
                image_path = item["cover"].replace('./img/', '../dataset_xiaohongshu/xiaohongshu/img/')
                image = preprocess_image(image_path).to(device)

                # Forward pass
                model.train()
                optimizer.zero_grad()
                prediction = model(image).squeeze()

                # Loss calculation
                target = torch.tensor([likes], dtype=torch.float32).to(device)
                loss = criterion(prediction, target)
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item()

                # 收集真实值和预测值
                y_true_all.append(likes)
                y_pred_all.append(prediction.item())

            except Exception as e:
                print(f"Error processing {item['cover']}: {e}")

        print(f"Epoch [{epoch + 1}/{num_epochs}], Loss: {epoch_loss:.4f}")

    # 计算并输出各项损失
    mse, mae, rmse, mape, r2 = compute_losses(y_true_all, y_pred_all)
    print(f"MSE: {mse:.4f}, MAE: {mae:.4f}, RMSE: {rmse:.4f}, MAPE: {mape:.4f}, R^2: {r2:.4f}")

    return model


# 训练模型
train_file_path = './train_data_feature.json'
train_model(train_file_path)
