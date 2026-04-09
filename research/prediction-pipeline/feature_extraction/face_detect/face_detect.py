# -*- coding:utf-8 -*-
import json
import os.path
import urllib.request
import urllib.error
import time
import re
from pathlib import Path
import pandas as pd
from tqdm import tqdm


def face_num_extra(image_path):
    pattern = r'\d+\.?\d*'
    http_url = 'https://api-cn.faceplusplus.com/facepp/v3/detect'
    key = "5UTEsTg9Vd3DNpiI9oUworOyin5aWRIj"
    secret = "Ab5NZGiM2RyQB7HQWyU9CUItw8qWhkLU"
    filepath = image_path

    boundary = '----------%s' % hex(int(time.time() * 1000))
    data = []
    data.append('--%s' % boundary)
    data.append('Content-Disposition: form-data; name="%s"\r\n' % 'api_key')
    data.append(key)
    data.append('--%s' % boundary)
    data.append('Content-Disposition: form-data; name="%s"\r\n' % 'api_secret')
    data.append(secret)
    data.append('--%s' % boundary)
    fr = open(filepath, 'rb')
    data.append('Content-Disposition: form-data; name="%s"; filename=" "' % 'image_file')
    data.append('Content-Type: %s\r\n' % 'application/octet-stream')
    data.append(fr.read())
    fr.close()
    data.append('--%s' % boundary)
    data.append('Content-Disposition: form-data; name="%s"\r\n' % 'return_landmark')
    data.append('1')
    data.append('--%s' % boundary)
    data.append('Content-Disposition: form-data; name="%s"\r\n' % 'return_attributes')
    data.append(
        "gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus")
    data.append('--%s--\r\n' % boundary)

    for i, d in enumerate(data):
        if isinstance(d, str):
            data[i] = d.encode('utf-8')

    http_body = b'\r\n'.join(data)

    # build http request
    req = urllib.request.Request(url=http_url, data=http_body)

    # header
    req.add_header('Content-Type', 'multipart/form-data; boundary=%s' % boundary)

    try:
        # post data to server
        resp = urllib.request.urlopen(req, timeout=5)
        # get response
        qrcont = resp.read().decode('utf-8')

        match = re.search(pattern, qrcont[-13:-1])
        if match:
            face_number = float(match.group())
        else:
            face_number = 0.0

        return face_number

    except urllib.error.HTTPError as e:

        print(e.read().decode('utf-8'))

        return -1.0


BASE_DIR = Path(__file__).resolve().parents[2]
IMG_PATH = BASE_DIR / 'feature_extraction' / 'icon_data' / 'raw-images'

all_data = json.load(open(BASE_DIR / 'text_image_features' / 'xiaohongshu.json', 'r', encoding='utf-8'))

for i in tqdm(all_data):
    cover = i['cover'].split('/')[-1]
    cover_path = IMG_PATH / cover
    try:
        face_num = face_num_extra(cover_path)
    except:
        face_num = -1.0

    i['face_num'] = face_num

with open(BASE_DIR / 'text_image_features' / 'xhs.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f)

