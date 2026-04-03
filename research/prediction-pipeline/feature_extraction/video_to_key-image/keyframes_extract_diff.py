# -*- coding: utf-8 -*-
"""
Created on Tue Dec  4 16:48:57 2018

keyframes extract tool

this key frame extract algorithm is based on interframe difference.

The principle is very simple
First, we load the video and compute the interframe difference between each frames

Then, we can choose one of these three methods to extract keyframes, which are 
all based on the difference method:

1. use the difference order
    The first few frames with the largest average interframe difference
    are considered to be key frames.
2. use the difference threshold
    The frames which the average interframe difference are large than the
    threshold are considered to be key frames.
3. use local maximum
    The frames which the average interframe difference are local maximum are
    considered to be key frames.
    It should be noted that smoothing the average difference value before
    calculating the local maximum can effectively remove noise to avoid
    repeated extraction of frames of similar scenes.

After a few experiment, the third method has a better key frame extraction effect.

The original code comes from the link below, I optimized the code to reduce
unnecessary memory consumption.
https://blog.csdn.net/qq_21997625/article/details/81285096

@author: zyb_as
"""
import cv2
import operator
import numpy as np
import matplotlib.pyplot as plt
import sys
from scipy.signal import argrelextrema
import os

from tqdm import tqdm


def smooth(x, window_len=13, window='hanning'):
    """smooth the data using a window with requested size.

    This method is based on the convolution of a scaled window with the signal.
    The signal is prepared by introducing reflected copies of the signal
    (with the window size) in both ends so that transient parts are minimized
    in the begining and end part of the output signal.

    input:
        x: the input signal
        window_len: the dimension of the smoothing window
        window: the type of window from 'flat', 'hanning', 'hamming', 'bartlett', 'blackman'
            flat window will produce a moving average smoothing.
    output:
        the smoothed signal

    example:
    import numpy as np
    t = np.linspace(-2,2,0.1)
    x = np.sin(t)+np.random.randn(len(t))*0.1
    y = smooth(x)

    see also:

    numpy.hanning, numpy.hamming, numpy.bartlett, numpy.blackman, numpy.convolve
    scipy.signal.lfilter

    TODO: the window parameter could be the window itself if an array instead of a string
    """
    print(len(x), window_len)
    # if x.ndim != 1:
    #     raise ValueError, "smooth only accepts 1 dimension arrays."
    #
    # if x.size < window_len:
    #     raise ValueError, "Input vector needs to be bigger than window size."
    #
    # if window_len < 3:
    #     return x
    #
    # if not window in ['flat', 'hanning', 'hamming', 'bartlett', 'blackman']:
    #     raise ValueError, "Window is on of 'flat', 'hanning', 'hamming', 'bartlett', 'blackman'"

    s = np.r_[2 * x[0] - x[window_len:1:-1],
              x, 2 * x[-1] - x[-1:-window_len:-1]]
    # print(len(s))

    if window == 'flat':  # moving average
        w = np.ones(window_len, 'd')
    else:
        w = getattr(np, window)(window_len)
    y = np.convolve(w / w.sum(), s, mode='same')
    return y[window_len - 1:-window_len + 1]


class Frame:
    """class to hold information about each frame

    """

    def __init__(self, id, diff):
        self.id = id
        self.diff = diff

    def __lt__(self, other):
        if self.id == other.id:
            return self.id < other.id
        return self.id < other.id

    def __gt__(self, other):
        return other.__lt__(self)

    def __eq__(self, other):
        return self.id == other.id and self.id == other.id

    def __ne__(self, other):
        return not self.__eq__(other)


def rel_change(a, b):
    x = (b - a) / max(a, b)
    print(x)
    return x


if __name__ == "__main__":
    # print(sys.executable)
    # Setting fixed threshold criteria
    USE_THRESH = False
    # fixed threshold value
    THRESH = 0.6
    # Setting fixed threshold criteria
    USE_TOP_ORDER = False
    # Setting local maxima criteria
    USE_LOCAL_MAXIMA = True
    # Number of top sorted frames
    NUM_TOP_FRAMES = 50

    # smoothing window size
    LEN_WINDOW = int(50)

    # Video path of the source file


    ERROR_FILE = 'icon_video_frame_error.txt'


    def extract_video_frames(videoNAME):

        videopath = OUTPUT_DIR + videoNAME[:-4]
        if not os.path.exists(videopath):
            os.makedirs(videopath)

        # print("target video :" + videoNAME)
        # print("frame save directory: " + outputdir)
        # load video and compute diff between frames
        # cap = cv2.VideoCapture(str(VIDEO_PATH + videoNAME))
        # 分解cap
        a = str(VIDEO_PATH + videoNAME)
        cap = cv2.VideoCapture(a)
        curr_frame = None
        prev_frame = None
        frame_diffs = []
        frames = []
        success, frame = cap.read()
        i = 0
        while (success):
            luv = cv2.cvtColor(frame, cv2.COLOR_BGR2LUV)
            curr_frame = luv
            if curr_frame is not None and prev_frame is not None:
                # logic here
                diff = cv2.absdiff(curr_frame, prev_frame)
                diff_sum = np.sum(diff)
                diff_sum_mean = diff_sum / (diff.shape[0] * diff.shape[1])
                frame_diffs.append(diff_sum_mean)
                frame = Frame(i, diff_sum_mean)
                frames.append(frame)
            prev_frame = curr_frame
            i = i + 1
            success, frame = cap.read()
        cap.release()

        # compute keyframe
        keyframe_id_set = set()
        if USE_TOP_ORDER:
            # sort the list in descending order
            frames.sort(key=operator.attrgetter("diff"), reverse=True)
            for keyframe in frames[:NUM_TOP_FRAMES]:
                keyframe_id_set.add(keyframe.id)
        if USE_THRESH:
            print("Using Threshold")
            for i in range(1, len(frames)):
                if (rel_change(np.float(frames[i - 1].diff), np.float(frames[i].diff)) >= THRESH):
                    keyframe_id_set.add(frames[i].id)
        if USE_LOCAL_MAXIMA:
            # print("Using Local Maxima")
            diff_array = np.array(frame_diffs)
            sm_diff_array = smooth(diff_array, LEN_WINDOW)
            frame_indexes = np.asarray(argrelextrema(sm_diff_array, np.greater))[0]
            for i in frame_indexes:
                keyframe_id_set.add(frames[i - 1].id)

            # plt.figure(figsize=(40, 20))
            # plt.locator_params(numticks=100)
            # plt.stem(sm_diff_array)
            # plt.savefig(dir + '/' + videopath[:-4] + '/plot.png')

        # save all keyframes as image
        cap = cv2.VideoCapture(str(VIDEO_PATH + videoNAME))
        curr_frame = None
        keyframes = []
        success, frame = cap.read()
        idx = 0
        while (success):
            if idx in keyframe_id_set:
                name = videoNAME[:-4] + '_' + str(idx) + ".jpg"
                save_path = os.path.join(videopath, name).replace(os.path.sep, '/')
                # save_path = os.path.join(videopath, name)
                cv2.imwrite(save_path, frame)
                # cv2.imwrite(os.path.join(videopath, name), frame)
                if success:
                    print("图像保存成功！")
                else:
                    print("图像保存失败！")
                keyframe_id_set.remove(idx)
            idx = idx + 1
            success, frame = cap.read()
        cap.release()


    import json

    # videolist1 = json.load(open("D:/zyj_exceltojason/icon_data.json"))
    with open("D:/zyj_exceltojason/icon_data.json", "r", encoding="utf-8") as f:
        videolist1 = json.load(f)
    # videolist2 = json.load(open('videolist2.json'))
    # videolist3 = json.load(open('videolist3.json'))
    # videolist4 = json.load(open('videolist4.json'))
    # videolist5 = json.load(open('videolist5.json'))
    # videolist = os.listdir(VIDEO_PATH)
    # for video in tqdm(videolist1):
    for item in tqdm(videolist1):
        video = item['video_id'] + '.mp4'
        # if video[:-4] in os.listdir(OUTPUT_DIR):
        #     continue
        try:
            extract_video_frames(video)
            # print("video: " + video + " has been processed")
        except:
            print("video: " + video + " has error")
            f = open(ERROR_FILE, 'a')
            f.write(video + '\n')
            f.close()

