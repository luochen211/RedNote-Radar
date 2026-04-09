import json
from pathlib import Path

error_video = ['6672dd51000000000600589d','66403733000000001e033514']
base_dir = Path(__file__).resolve().parent
data1 = json.load(open('test_data_feature.json', 'r', encoding='utf-8'))
data2 = json.load(open('val_data_feature.json', 'r', encoding='utf-8'))
data3 = json.load(open('train_data_feature.json', 'r', encoding='utf-8'))
all_data = data1 + data2 + data3

face = json.load(open(base_dir / 'xhs.json', 'r'))
aestietic = json.load(open(base_dir.parent / 'feature_extraction' / 'deep-photo-aesthetics-master' / 'xiaohongshu_shoutu_aesthetics.json', 'r'))

cover_face_dict = {}
for i in face:
    i_cover = i['cover'].split('/')[-1]
    i_cover_face = i['face_num']
    cover_face_dict[i_cover] = i_cover_face

for i in all_data:
    vid = i['video_id']
    if vid in error_video:
        all_data.remove(i)
        continue
    cover = i['cover'].split('/')[-1]
    i_aesthtic = aestietic[cover]
    i['img_aesthetics'] = i_aesthtic

    i_facenum = cover_face_dict[cover]
    i['face_num'] = i_facenum
#
with open(base_dir / 'xiaohongshu_.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f)
