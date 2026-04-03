import json

from PIL import Image
import os

from tqdm import tqdm

EXIST = os.listdir(r'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\img_change_format')

change_error = []

def resize_and_convert_image(input_path, output_path):
    img_list = os.listdir(input_path)
    for img_name in tqdm(img_list):
        input_image_path = os.path.join(input_path, img_name)
        output_image_path = os.path.join(output_path, img_name)
        if img_name in EXIST:
            continue
        # 打开图像
        try:
            with Image.open(input_image_path) as img:
                # 获取图像的尺寸
                width, height = img.size

                # 确保图像的尺寸在最小和最大限制之间
                min_size = (48, 48)
                max_size = (4096, 4096)

                # if width < min_size[0] or height < min_size[1]:
                #     # 调整图像大小到最小尺寸
                #     img = img.resize(min_size, Image.ANTIALIAS)
                # elif width > max_size[0] or height > max_size[1]:
                #     # 调整图像大小到最大尺寸，保持宽高比
                #     ratio = min(max_size[0] / width, max_size[1] / height)
                #     new_size = (int(width * ratio), int(height * ratio))
                #     img = img.resize(new_size, Image.ANTIALIAS)

                    # 将图像转换为 JPG 格式
                img.convert("RGB").save(output_image_path, "JPEG", quality=85)  # 质量参数可调

            # 检查文件大小，如果大于 1.5MB，则逐步降低质量
            # quality = 85
            # while os.path.getsize(output_image_path) / (1024 * 1024) > 2.0:
            #     quality -= 5
            #     if quality < 10:  # 最低质量限制
            #         raise ValueError("Unable to compress image to below 1.5MB while maintaining quality.")
            #     img.convert("RGB").save(output_image_path, "JPEG", quality=quality)

        except:
            change_error.append(img_name)
            continue

        # 示例用法

    # json
    with open('change_error.json', 'w') as f:
        json.dump(change_error, f, ensure_ascii=False, indent=4)

IMG_PATH = r'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\img'
PUT_PATH = r'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\img_change_format'

# tst
# IMG_PATH = r'./images'
# PUT_PATH = r'./images_change_format'

if not os.path.exists(PUT_PATH):
    os.makedirs(PUT_PATH)

# input_image_path = "./images/5a0273a8c344e27026fee33a_1.jpg"  # 输入图像路径
# output_image_path = "output_image.jpg"  # 输出图像路径

# try:
resize_and_convert_image(IMG_PATH, PUT_PATH)
    # print(f"Image saved as {output_image_path}")
# except Exception as e:
    # print(f"Error processing image: {e}")