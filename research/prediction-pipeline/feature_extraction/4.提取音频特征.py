import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"  # 添加这一行
import torch
# import torchaudio
import numpy as np
import pickle
from torch import nn
from tqdm import tqdm

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 指定文件夹和输出文件夹
# F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\error_video
audio_folder = 'D:/szz_featureextraction/icon_data/audio'
# audio_folder = 'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\error_audios'
output_folder = "D:/szz_featureextraction/icon_data/audio_fea"
# output_folder = "F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshuaudios_features_"
# 创建一个空字典来存储音频特征
audio_features_dict = {}


model = torch.hub.load('./torchvggish/', 'vggish', source = 'local')
model = model.to(device)
model.eval()

# error_txt = open('extract_audio_features_error.txt', 'a')

#这里完全可以使用GPU进行运算，记得使用GPU快一些
# 遍历音频文件夹中的所有.wav文件

for audio_filename in tqdm(os.listdir(audio_folder)):
    try:
        audio_path = os.path.join(audio_folder, audio_filename)
        # 使用VGGish模型提取特征
        features = model.forward(audio_path)
        # 将特征转换为列表
        features = features.cpu().tolist()

        output_file = os.path.join(output_folder, f"{audio_filename[:-4]}.pkl")
        with open(output_file, "wb") as f:
            pickle.dump(features, f)
    except:
        print(f"提取音频特征时出错: {audio_filename}")
        # error_txt.write(f"{audio_filename}\n")
        continue
#     将特征添加到字典中
#     audio_features_dict[audio_filename[:-4]] = features
#
# error_txt.close()





# 保存音频特征字典为.pkl文件
# output_file = 'dict_vid_audioconvfea.pkl'
# with open(output_file, 'wb') as f:
#     pickle.dump(audio_features_dict, f)

# print(f"音频特征已提取并保存到{output_file}文件中。")
