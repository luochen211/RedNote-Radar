# coding: utf-8
# from data_provider import *
from tqdm import tqdm

# from C3D_model import *
import torchvision
import torch
from torch.autograd import Variable
import torch.nn.functional as F
import argparse
import os 
from torch import save, load
import pickle
import time
import numpy as np
import PIL.Image as Image
import skimage.io as io
from skimage.transform import resize
import h5py
from PIL import Image
# 不要打印ffmpeg的输出
import subprocess
import sys
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

def feature_extractor():
	# net = C3D(487)
	# net.load_state_dict(torch.load('c3d.pickle'))
	# if RUN_GPU :
	# 	net.cuda(0)
	# net.eval()
	# feature_dim = 4096 if EXTRACTED_LAYER != 5 else 8192

	# read video list from the folder
	# video_list = os.listdir(VIDEO_DIR)

	with open(ERROR_FILE, 'r') as f:
		video_list = f.readlines()
		video_list = [video.strip() for video in video_list]

	gpu_id = args.gpu_id

	# if not os.path.isdir(OUTPUT_DIR):
	# 	os.mkdir(OUTPUT_DIR)
	# f = h5py.File(os.path.join(OUTPUT_DIR, OUTPUT_NAME), 'w')

	# 存放视频帧的文件夹
	temp_path = r'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\video_frames_error\\'
	if not os.path.exists(temp_path):
		os.mkdir(temp_path)

	# error_fid = open('extract_frame_error.txt', 'w')


	for video_name in video_list:
		video_path = os.path.join(VIDEO_DIR, video_name)
		frame_path = os.path.join(temp_path, video_name)
		if not os.path.exists(frame_path):
			os.mkdir(frame_path)

		# print('\n')
		# print('Using ffmpeg extracting video frames ...')
		# using ffmpeg to extract video frames into a temporary folder
		try:
			os.system('ffmpeg -loglevel quiet -i ' + video_path + ' -q:v 20 -f image2 ' + frame_path + '/image_%5d.jpg')
		except:
			# error_fid.write(video_name+'\n')
			print('Fail to extract frames for video: %s'%video_name)
			continue
		# -q:v 10 表示提取的视频帧的质量，值越小，视频帧质量越高
		# print('Extracting frames success.')
	#	# 下面的for循环是提取视频clip类型的特征，不提取特征就把下面的注释掉
	# 	if USEC3D:
	# 		# 不用C3D提取特征就把下面的代码注释掉
	# 		print('Using C3D extracting features ...')
	# 		total_frames = len(os.listdir(frame_path))
	# 		if total_frames == 0:
	# 			error_fid.write(video_name+'\n')
	# 			print('Fail to extract frames for video: %s'%video_name)
	# 			continue
	#
	# 		valid_frames = total_frames / nb_frames * nb_frames
	# 		n_feat = int(valid_frames / nb_frames)
	# 		n_batch = int(n_feat / BATCH_SIZE)
	# 		if n_feat - n_batch*BATCH_SIZE > 0:
	# 			n_batch = n_batch + 1
	# 		# print('n_frames: %d; n_feat: %d; n_batch: %d'%(total_frames, n_feat, n_batch))
	#
	# 		index_w = np.random.randint(resize_w - crop_w) ## crop
	# 		index_h = np.random.randint(resize_h - crop_h) ## crop
	#
	# 		features = []
	#
	# 		# 不提取特征就不执行下面的for
	# 		for i in range(n_batch-1):
	# 			input_blobs = []
	# 			for j in range(BATCH_SIZE):
	# 				clip = []
	# 				clip = np.array([resize(io.imread(os.path.join(frame_path, 'image_{:05d}.jpg'.format(k))), output_shape=(resize_w, resize_h), preserve_range=True) for k in range((i*BATCH_SIZE+j) * nb_frames+1, min((i*BATCH_SIZE+j+1) * nb_frames+1, valid_frames+1))])
	# 				# print('clip_shape', clip.shape)
	# 				clip = clip[:, index_w: index_w+ crop_w, index_h: index_h+ crop_h, :]
	# 				# print('clip_shape',clip.shape)
	# 				# print('range', range((i*BATCH_SIZE+j) * nb_frames+1, min((i*BATCH_SIZE+j+1) * nb_frames+1, valid_frames+1)))
	# 				input_blobs.append(clip)
	# 			input_blobs = np.array(input_blobs, dtype='float32')
	# 			# print('input_blobs_shape', input_blobs.shape)
	# 			input_blobs = torch.from_numpy(np.float32(input_blobs.transpose(0, 4, 1, 2, 3)))
	# 			input_blobs = Variable(input_blobs).cuda() if RUN_GPU else Variable(input_blobs)
	# 			_, batch_output = net(input_blobs, EXTRACTED_LAYER)
	# 			batch_feature  = (batch_output.data).cpu()
	# 			features.append(batch_feature)
	#
	# 		# The last batch
	# 		input_blobs = []
	# 		for j in range(n_feat-(n_batch-1)*BATCH_SIZE):
	# 			clip = []
	# 			clip = np.array([resize(io.imread(os.path.join(frame_path, 'image_{:05d}.jpg'.format(k))), output_shape=(resize_w, resize_h), preserve_range=True) for k in range(((n_batch-1)*BATCH_SIZE+j) * nb_frames+1, min(((n_batch-1)*BATCH_SIZE+j+1) * nb_frames+1, valid_frames+1))])
	#
	# 			clip = clip[:, index_w: index_w+ crop_w, index_h: index_h+ crop_h, :]
	# 			# print('range', range(((n_batch-1)*BATCH_SIZE+j) * nb_frames+1, min(((n_batch-1)*BATCH_SIZE+j+1) * nb_frames+1, valid_frames+1)))
	# 			input_blobs.append(clip)
	# 		input_blobs = np.array(input_blobs, dtype='float32')
	# 		# print('input_blobs_shape', input_blobs.shape)
	# 		input_blobs = torch.from_numpy(np.float32(input_blobs.transpose(0, 4, 1, 2, 3)))
	# 		input_blobs = Variable(input_blobs).cuda() if RUN_GPU else Variable(input_blobs)
	# 		_, batch_output = net(input_blobs, EXTRACTED_LAYER)
	# 		batch_feature  = (batch_output.data).cpu()
	# 		features.append(batch_feature)
	#
	# 		features = torch.cat(features, 0)
	# 		print('features_shape', features.shape)
	# 		features = features.numpy()
	# 		fgroup = f.create_group(video_name[:-4])
	# 		fgroup.create_dataset('c3d_features', data=features)
	# 		fgroup.create_dataset('total_frames', data=np.array(total_frames))
	# 		fgroup.create_dataset('valid_frames', data=np.array(valid_frames))
	#
	# 		print ('%s has been processed...'%video_name)




if __name__ == "__main__":

	parser = argparse.ArgumentParser()
	base_dir = Path(__file__).resolve().parent

	print ('******--------- Extract C3D features ------*******')
	parser.add_argument('-o', '--OUTPUT_DIR', dest='OUTPUT_DIR', type=str, default=str(base_dir / 'icon_data' / 'keyframes'), help='Output file name')
	parser.add_argument('-l', '--EXTRACTED_LAYER', dest='EXTRACTED_LAYER', type=int, choices=[5, 6, 7], default=6, help='Feature extractor layer')
	parser.add_argument('-i', '--VIDEO_DIR', dest='VIDEO_DIR', type = str, default=str(base_dir / 'icon_data' / 'raw-videos'),help='Input Video directory')
	parser.add_argument('-gpu', '--gpu', dest='GPU', action = 'store_true', default=False, help='Run GPU?')
	parser.add_argument('--OUTPUT_NAME', default='c3d_features.hdf5', help='The output name of the hdf5 features')
	parser.add_argument('-b', '--BATCH_SIZE', default=20, help='the batch size')
	parser.add_argument('-id', '--gpu_id', default=1, type=int)
	parser.add_argument('-p', '--video_list_file', type=str, default= './kickstarter/video_list.txt',help='the video name list')

	args = parser.parse_args()
	params = vars(args) # convert to ordinary dict
	# print ('parsed parameters:')

	OUTPUT_DIR = params['OUTPUT_DIR']
	EXTRACTED_LAYER = params['EXTRACTED_LAYER']
	VIDEO_DIR = params['VIDEO_DIR']
	RUN_GPU = params['GPU']
	OUTPUT_NAME = params['OUTPUT_NAME']
	BATCH_SIZE = params['BATCH_SIZE']
	USEC3D = False
	ERROR_FILE = str(base_dir / 'video_to_key-image' / 'empty-video-frame-directories.txt')

	crop_w = 112
	resize_w = 128
	crop_h = 112
	resize_h = 171
	nb_frames = 128 # 一个clip的长度
	# 打印开始的时间
	start_time = time.time()
	# 调用函数
	feature_extractor()
	# 打印运行的时间
	print('run time', int((time.time() - start_time) / 60), 'min')
