import pandas as pd
import json
import os

# Read the data from the CSV file
def read_data_from_csv(csv_file_path):
    data = pd.read_csv(csv_file_path)
    return data

# Preprocess the data
def preprocess_data(data):
    data = data.drop(['酒店主页链接', '酒店号id', '小红书号', '头像链接', '笔记链接', '笔记首图', '笔记图片链接（需下载）', '笔记ip归属地'], axis=1)
    columns_name = ['hotel_name', 'ip_loc', 'user_desc', 'follows', 'subscribers', 'praises', 'video_id', 'type',
                    'title', 'cover', 'text', 'likes', 'favors', 'comments', 'shares', 'upload_time', 'tags']
    # 酒店名字，酒店ip地址，用户描述，follows关注数，subscribers粉丝数，praises点赞数，视频id，类型，标题，封面，文本，likes点赞，favors收藏数，评论数，
    # 分享数，上传时间，标签
    data.columns = columns_name
    # data['upload_time'] = pd.to_datetime(data['upload_time'])
    data = data[data['type'] == 'video']#4053
    # print(data['upload_time'].head())
    return data


if __name__ == '__main__':
    json_file_path = r"D:\zyj_exceltojason\icon_data.json"
    csv_file_path = r"D:\zyj_exceltojason\icon_data.csv"
    data = read_data_from_csv(csv_file_path)
    # data = preprocess_data(data)
    #data.to_csv('data1.csv', index=False, encoding='utf-8-sig')
    data = data.to_dict(orient='records')
    # data = json.dump(data, open(json_file_path, 'w'), ensure_ascii=False, indent=4)
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)