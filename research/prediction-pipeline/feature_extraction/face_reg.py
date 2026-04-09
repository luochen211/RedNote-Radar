import face_recognition
from pathlib import Path


def detect_faces(image_path):
    # 加载图片
    image = face_recognition.load_image_file(image_path)

    # 检测人脸位置（可调节参数）
    face_locations = face_recognition.face_locations(
        image,
        number_of_times_to_upsample=2,  # 提高检测精度（0=快速，2=更准确）
        model="hog"  # "hog"（速度快），"cnn"（高精度需GPU）
    )

    # 返回结果
    num_faces = len(face_locations)
    # if num_faces == 0:
    #     print("未检测到人脸")
    # else:
    #     print(f"检测到 {num_faces} 张人脸")

    return num_faces


# 使用示例
# face_positions = detect_faces(r"C:\Users\shuzhiml02\Desktop\图片1.png")

# 打印人脸位置 (top, right, bottom, left)
# for i, loc in enumerate(face_positions):
#     print(f"人脸 #{i + 1}: 位置坐标 {loc}")

import os
import json
from tqdm import tqdm
if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    base_img_dir = base_dir / "icon_data" / "raw-images"
    json_path = base_dir / "deep-photo-aesthetics-master" / "icon_data_with_aesthetic.json"
    output_json = base_dir / "icon_data_all.json"

    # 1. 读取原始JSON文件
    with open(json_path, 'r', encoding='utf-8') as f:
        video_data = json.load(f)  # 假设是字典列表

    # 2. 处理每个视频条目
    for item in tqdm(video_data, desc="Processing cover images"):
        # 获取封面图片路径
        cover_path = item["cover"]

        # 从"./img/xxx.jpg"提取文件名
        filename = os.path.basename(cover_path)

        # 构建完整图片路径
        full_img_path = base_img_dir / filename

        # 3. 检查图片是否存在
        if not full_img_path.exists():
            print(f"Warning: Image not found - {full_img_path}")
            item["img_aesthetics"] = None
            continue

        # 4. 处理图片并预测分数
        try:
            num_faces = detect_faces(str(full_img_path))
            # if use_cuda:
            #     img_tensor = img_tensor.cuda()
            #
            # with torch.no_grad():
            #     features = net(img_tensor)

            # 提取预测分数（假设extract_prediction函数已定义）
            # result = extract_prediction(features, net)
            # score = result['score'].cpu().item()
            item["face_num"] = num_faces

        except Exception as e:
            print(f"Error processing {full_img_path}: {str(e)}")
            item["face_num"] = None

    # 5. 保存包含美学分数的新JSON文件
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(video_data, f, ensure_ascii=False, indent=2)

    print(f"处理完成! 结果已保存至: {output_json}")
