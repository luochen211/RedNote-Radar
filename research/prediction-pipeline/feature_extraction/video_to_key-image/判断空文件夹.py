import os



def is_folder_empty(folder_path):
    try:
        # 获取文件夹内容
        contents = os.listdir(folder_path)
        # 判断内容是否为空
        if not contents:
            return True
        else:
            return False
    except FileNotFoundError:
        # 文件夹路径不存在时抛出异常
        print(f"The folder '{folder_path}' does not exist.")
        return False

    # 示例用法

FRAME_DIR = 'F:/mj/polyuproject/mmvideo/dataset_xiaohongshu/xiaohongshu/video_frames/'

# error_txt = open('空视频帧文件夹.txt', 'a')

for subdir in os.listdir(FRAME_DIR):
    subdir_path = os.path.join(FRAME_DIR, subdir)
    if is_folder_empty(subdir_path):
        print(f"The folder '{subdir}' is empty.")
        os.rmdir(subdir_path)
        # error_txt.write(f"{subdir}\n")

# error_txt.close()

