import os
from pathlib import Path

from moviepy.editor import VideoFileClip
from tqdm import tqdm

BASE_DIR = Path(__file__).resolve().parent
video_path = BASE_DIR / "icon_data" / "raw-videos"
audio_output_path = BASE_DIR / "icon_data" / "audio"
audio_output_path.mkdir(parents=True, exist_ok=True)


def extract_audio_from_video(video_path, audio_output_path):
	video_list = os.listdir(video_path)
	for video_name in tqdm(video_list):
		audio_name = video_name.replace('.mp4', '.wav')
		if audio_name in os.listdir(audio_output_path):
			continue
		# 加载视频文件
		try:
			video_clip = VideoFileClip(str(Path(video_path) / video_name))
			# 提取音频
			audio_clip = video_clip.audio
			audio_clip.write_audiofile(str(Path(audio_output_path) / audio_name))
		except:
			print('error:', video_name)
			continue
			# f = open('video2audio_save_audio_error.txt', 'a')
			# f.write(video_name + '\n')
			# f.close()

extract_audio_from_video(video_path, audio_output_path)
