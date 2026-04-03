import os
import json

IMG_PATH = r'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\img'
IMG_LIST = os.listdir(IMG_PATH)

list_1 = IMG_LIST[:50000]
list_2 = IMG_LIST[50000:100000]
list_3 = IMG_LIST[100000:150000]
list_4 = IMG_LIST[150000:200000]
list_5 = IMG_LIST[200000:]

with open('shoutu_1.json', 'w') as f:
    json.dump(list_1, f)

with open('shoutu_2.json', 'w') as f:
    json.dump(list_2, f)

with open('shoutu_3.json', 'w') as f:
    json.dump(list_3, f)

with open('shoutu_4.json', 'w') as f:
    json.dump(list_4, f)

with open('shoutu_5.json', 'w') as f:
    json.dump(list_5, f)