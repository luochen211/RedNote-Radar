# 检查从视频中提取的音频能不能对应上

import os
import pickle

video_list = os.listdir('F:/mj/polyuproject/mmvideo/dataset_xiaohongshu/xiaohongshu/video_combine/video/')

frame_list = os.listdir('F:/mj/polyuproject/mmvideo/dataset_xiaohongshu/xiaohongshu/video_frames_/')

for video in video_list:
    if video[:-4] not in frame_list:
        print(video)