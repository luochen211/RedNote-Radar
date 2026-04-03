import collections
import json
import os
import time

import torch
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from gensim.models import KeyedVectors

from models.Baselines import *
from models.FANVM import FANVMModel
from models.SVFEND import SVFENDModel, MYMODEL
from models.TikTec import TikTecModel

from utils.dataloader import *
from models.Trainer import Trainer
from models.Trainer_3set import Trainer3


# os.environ["CUDA_VISIBLE_DEVICES"] = "0"

def pad_sequence(seq_len, lst, emb):
    result = []
    for video in lst:
        if isinstance(video, list):
            video = torch.stack(video)
        ori_len = video.shape[0]
        if ori_len == 0:
            video = torch.zeros([seq_len, emb], dtype=torch.long)
        elif ori_len >= seq_len:
            if emb == 200:
                video = torch.FloatTensor(video[:seq_len])
            else:
                video = torch.LongTensor(video[:seq_len])
        else:
            video = torch.cat([video, torch.zeros([seq_len - ori_len, video.shape[1]], dtype=torch.long)], dim=0)
            if emb == 200:
                video = torch.FloatTensor(video)
            else:
                video = torch.LongTensor(video)
        result.append(video)
    return torch.stack(result)


def pad_sequence_bbox(seq_len, lst):
    result = []
    for video in lst:
        if isinstance(video, list):
            video = torch.stack(video)
        ori_len = video.shape[0]
        if ori_len == 0:
            video = torch.zeros([seq_len, 45, 4096], dtype=torch.float)
        elif ori_len >= seq_len:
            video = torch.FloatTensor(video[:seq_len])
        else:
            video = torch.cat([video, torch.zeros([seq_len - ori_len, 45, 4096], dtype=torch.float)], dim=0)
        result.append(video)
    return torch.stack(result)


def pad_frame_sequence(seq_len, lst):
    attention_masks = []
    result = []
    for video in lst:
        video = torch.FloatTensor(video)
        ori_len = video.shape[0]
        if ori_len >= seq_len:
            gap = ori_len // seq_len
            video = video[::gap][:seq_len]
            mask = np.ones((seq_len))
        else:
            video = torch.cat((video, torch.zeros([seq_len - ori_len, video.shape[1]], dtype=torch.float)), dim=0)
            mask = np.append(np.ones(ori_len), np.zeros(seq_len - ori_len))
        result.append(video)
        mask = torch.IntTensor(mask)
        attention_masks.append(mask)
    return torch.stack(result), torch.stack(attention_masks)


def _init_fn(worker_id):
    np.random.seed(2022)


def SVFEND_collate_fn(batch):
    num_comments = 23
    num_frames = 83
    num_audioframes = 50

    intro_inputid = [item['intro_inputid'] for item in batch]
    intro_mask = [item['intro_mask'] for item in batch]

    title_inputid = [item['title_inputid'] for item in batch]
    title_mask = [item['title_mask'] for item in batch]

    comments_like = [item['comments_like'] for item in batch]
    comments_inputid = [item['comments_inputid'] for item in batch]
    comments_mask = [item['comments_mask'] for item in batch]

    comments_inputid_resorted = []
    comments_mask_resorted = []
    comments_like_resorted = []

    for idx in range(len(comments_like)):
        comments_like_one = comments_like[idx]
        comments_inputid_one = comments_inputid[idx]
        comments_mask_one = comments_mask[idx]
        if comments_like_one.shape != torch.Size([0]):
            comments_inputid_one, comments_mask_one, comments_like_one = (list(t) for t in zip(*sorted(
                zip(comments_inputid_one, comments_mask_one, comments_like_one), key=lambda s: s[2], reverse=True)))
        comments_inputid_resorted.append(comments_inputid_one)
        comments_mask_resorted.append(comments_mask_one)
        comments_like_resorted.append(comments_like_one)

    comments_inputid = pad_sequence(num_comments, comments_inputid_resorted, 250)
    comments_mask = pad_sequence(num_comments, comments_mask_resorted, 250)
    comments_like = []
    for idx in range(len(comments_like_resorted)):
        comments_like_resorted_one = comments_like_resorted[idx]
        if len(comments_like_resorted_one) >= num_comments:
            comments_like.append(torch.tensor(comments_like_resorted_one[:num_comments]))
        else:
            if isinstance(comments_like_resorted_one, list):
                comments_like.append(
                    torch.tensor(comments_like_resorted_one + [0] * (num_comments - len(comments_like_resorted_one))))
            else:
                comments_like.append(torch.tensor(
                    comments_like_resorted_one.tolist() + [0] * (num_comments - len(comments_like_resorted_one))))

    frames = [item['frames'] for item in batch]
    frames, frames_masks = pad_frame_sequence(num_frames, frames)

    audioframes = [item['audioframes'] for item in batch]
    audioframes, audioframes_masks = pad_frame_sequence(num_audioframes, audioframes)

    # c3d  = [item['c3d'] for item in batch]
    # c3d, c3d_masks = pad_frame_sequence(num_frames, c3d)

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'intro_inputid': torch.stack(intro_inputid),
        'intro_mask': torch.stack(intro_mask),
        'title_inputid': torch.stack(title_inputid),
        'title_mask': torch.stack(title_mask),
        'comments_inputid': comments_inputid,
        'comments_mask': comments_mask,
        'comments_like': torch.stack(comments_like),
        'audioframes': audioframes,
        'audioframes_masks': audioframes_masks,
        'frames': frames,
        'frames_masks': frames_masks,
        # 'c3d': c3d,
        # 'c3d_masks': c3d_masks,
    }


def XIAOHONGSHU_collate_fn(batch):
    # num_comments = 23
    num_frames = 83
    num_audioframes = 50

    video_feature = [item['video_feature'] for item in batch]
    video_feature, video_mask = pad_frame_sequence(num_frames, video_feature)

    audio_feature = [item['audio_feature'] for item in batch]
    audio_feature, audio_mask = pad_frame_sequence(num_audioframes, audio_feature)

    txt_inputid = [item['txt_inputid'] for item in batch]
    txt_mask = [item['txt_mask'] for item in batch]

    label = [item['label'] for item in batch]
    follows = [item['follows'] for item in batch]
    subscribers = [item['subscribers'] for item in batch]
    praises = [item['praises'] for item in batch]
    favors = [item['favors'] for item in batch]
    comments = [item['comments'] for item in batch]
    shares = [item['shares'] for item in batch]
    ttsimilarity = [item['ttsimilarity'] for item in batch]
    numtags = [item['numtags'] for item in batch]
    itsimilarity = [item['itsimilarity'] for item in batch]
    readability = [item['readability'] for item in batch]
    imgquality = [item['imgquality'] for item in batch]
    titlesentiment = [item['titlesentiment'] for item in batch]
    imgaesthetics = [item['imgaesthetics'] for item in batch]
    facenum = [item['face_num'] for item in batch]
    # maxvaluedict = [item['max_value'] for item in batch]

    return {
        'label': torch.stack(label),
        'video_feature': video_feature,
        'video_mask': video_mask,
        'audio_feature': audio_feature,
        'audio_mask': audio_mask,
        'txt_inputid': torch.stack(txt_inputid),
        'txt_mask': torch.stack(txt_mask),
        'follows': torch.stack(follows),
        'subscribers': torch.stack(subscribers),
        'praises': torch.stack(praises),
        'favors': torch.stack(favors),
        'comments': torch.stack(comments),
        'shares': torch.stack(shares),
        'ttsimilarity': torch.stack(ttsimilarity),
        'numtags': torch.stack(numtags),
        'itsimilarity': torch.stack(itsimilarity),
        'readability': torch.stack(readability),
        'imgquality': torch.stack(imgquality),
        'titlesentiment': torch.stack(titlesentiment),
        'imgaesthetics': torch.stack(imgaesthetics),
        'facenum': torch.stack(facenum),
        # 'max_value_dict': maxvaluedict,
    }


def FANVM_collate_fn(batch):
    num_comments = 23
    num_frames = 83

    title_inputid = [item['title_inputid'] for item in batch]
    title_mask = [item['title_mask'] for item in batch]

    comments_like = [item['comments_like'] for item in batch]
    comments_inputid = [item['comments_inputid'] for item in batch]
    comments_mask = [item['comments_mask'] for item in batch]

    comments_inputid_resorted = []
    comments_mask_resorted = []
    comments_like_resorted = []

    for idx in range(len(comments_like)):
        comments_like_one = comments_like[idx]
        comments_inputid_one = comments_inputid[idx]
        comments_mask_one = comments_mask[idx]
        if comments_like_one.shape != torch.Size([0]):
            comments_inputid_one, comments_mask_one, comments_like_one = (list(t) for t in zip(*sorted(
                zip(comments_inputid_one, comments_mask_one, comments_like_one), key=lambda s: s[2], reverse=True)))
        comments_inputid_resorted.append(comments_inputid_one)
        comments_mask_resorted.append(comments_mask_one)
        comments_like_resorted.append(comments_like_one)

    comments_inputid = pad_sequence(num_comments, comments_inputid_resorted, 250)
    comments_mask = pad_sequence(num_comments, comments_mask_resorted, 250)
    comments_like = []
    for idx in range(len(comments_like_resorted)):
        comments_like_resorted_one = comments_like_resorted[idx]
        if len(comments_like_resorted_one) >= num_comments:
            comments_like.append(torch.tensor(comments_like_resorted_one[:num_comments]))
        else:
            if isinstance(comments_like_resorted_one, list):
                comments_like.append(
                    torch.tensor(comments_like_resorted_one + [0] * (num_comments - len(comments_like_resorted_one))))
            else:
                comments_like.append(torch.tensor(
                    comments_like_resorted_one.tolist() + [0] * (num_comments - len(comments_like_resorted_one))))

    frames = [item['frames'] for item in batch]
    frames, frames_masks = pad_frame_sequence(num_frames, frames)
    frame_thmub = [item['frame_thmub'] for item in batch]

    label = [item['label'] for item in batch]
    label_event = [item['label_event'] for item in batch]
    s = [item['s'] for item in batch]

    return {
        'label': torch.stack(label),
        'title_inputid': torch.stack(title_inputid),
        'title_mask': torch.stack(title_mask),
        'comments_inputid': comments_inputid,
        'comments_mask': comments_mask,
        'comments_like': torch.stack(comments_like),
        'frames': frames,
        'frames_masks': frames_masks,
        'frame_thmub': torch.stack(frame_thmub),
        's': torch.stack(s),
        'label_event': torch.stack(label_event),
    }


def bbox_collate_fn(batch):
    num_frames = 83

    bbox_vgg = [item['bbox_vgg'] for item in batch]
    bbox_vgg = pad_sequence_bbox(num_frames, bbox_vgg)

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'bbox_vgg': bbox_vgg,
    }


def c3d_collate_fn(batch):
    num_frames = 83

    c3d = [item['c3d'] for item in batch]
    c3d, c3d_masks = pad_frame_sequence(num_frames, c3d)

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'c3d': c3d,
        'c3d_masks': c3d_masks,
    }


def vgg_collate_fn(batch):
    num_frames = 83

    frames = [item['frames'] for item in batch]
    frames, frames_masks = pad_frame_sequence(num_frames, frames)

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'frames': frames,
        'frames_masks': frames_masks,
    }


def comments_collate_fn(batch):
    num_comments = 23

    comments_like = [item['comments_like'] for item in batch]
    comments_inputid = [item['comments_inputid'] for item in batch]
    comments_mask = [item['comments_mask'] for item in batch]

    comments_inputid_resorted = []
    comments_mask_resorted = []
    comments_like_resorted = []

    for idx in range(len(comments_like)):
        comments_like_one = comments_like[idx]
        comments_inputid_one = comments_inputid[idx]
        comments_mask_one = comments_mask[idx]
        if comments_like_one.shape != torch.Size([0]):
            comments_inputid_one, comments_mask_one, comments_like_one = (list(t) for t in zip(*sorted(
                zip(comments_inputid_one, comments_mask_one, comments_like_one), key=lambda s: s[2], reverse=True)))
        comments_inputid_resorted.append(comments_inputid_one)
        comments_mask_resorted.append(comments_mask_one)
        comments_like_resorted.append(comments_like_one)

    comments_inputid = pad_sequence(num_comments, comments_inputid_resorted, 250)
    comments_mask = pad_sequence(num_comments, comments_mask_resorted, 250)
    comments_like = []
    for idx in range(len(comments_like_resorted)):
        comments_like_resorted_one = comments_like_resorted[idx]
        if len(comments_like_resorted_one) >= num_comments:
            comments_like.append(torch.tensor(comments_like_resorted_one[:num_comments]))
        else:
            if isinstance(comments_like_resorted_one, list):
                comments_like.append(
                    torch.tensor(comments_like_resorted_one + [0] * (num_comments - len(comments_like_resorted_one))))
            else:
                comments_like.append(torch.tensor(
                    comments_like_resorted_one.tolist() + [0] * (num_comments - len(comments_like_resorted_one))))

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'comments_inputid': comments_inputid,
        'comments_mask': comments_mask,
        'comments_like': torch.stack(comments_like),
    }


def title_w2v_collate_fn(batch):
    length_title = 128
    title_w2v = [item['title_w2v'] for item in batch]
    title_w2v = pad_sequence(length_title, title_w2v, 100)

    label = [item['label'] for item in batch]

    return {
        'label': torch.stack(label),
        'title_w2v': title_w2v,
    }


class Run():
    def __init__(self,
                 config
                 ):
        self.config = config

        self.model_name = config['model_name']
        self.mode_eval = config['mode_eval']
        self.fold = config['fold']
        self.data_type = 'XIAOHONGSHU'

        self.epoches = config['epoches']
        self.batch_size = config['batch_size']
        self.num_workers = config['num_workers']
        self.epoch_stop = config['epoch_stop']
        self.seed = config['seed']
        self.device = config['gpu']
        self.lr = config['lr']
        self.lambd = config['lambd']
        self.save_param_dir = config['path_param']
        self.path_tensorboard = config['path_tensorboard']
        self.dropout = config['dropout']
        self.weight_decay = config['weight_decay']
        self.event_num = 616
        self.mode = 'normal'
        self.train_scope = config['train_scope']
    def get_dataloader(self, data_type):
        collate_fn = None

        if data_type == 'XIAOHONGSHU':
            if self.train_scope == 'all':
                dataset_train = XIAOHONGSHUDataset(self.config, 'train', 'all')
                train_maxvlue_dict = dataset_train.max_value_dict
                dataset_test = XIAOHONGSHUDataset(self.config, 'test', 'all')
                test_maxvlue_dict = dataset_test.max_value_dict
                # dataset_dev = XIAOHONGSHUDataset(self.config, 'dev')
                # dev_maxvlue_dict = dataset_dev.max_value_dict
                collate_fn = XIAOHONGSHU_collate_fn
            else:
                dataset_train = XIAOHONGSHUDataset(self.config, 'train', 'icon')
                train_maxvlue_dict = dataset_train.max_value_dict
                dataset_test = XIAOHONGSHUDataset(self.config, 'test', 'icon')
                test_maxvlue_dict = dataset_test.max_value_dict
                # dataset_dev = XIAOHONGSHUDataset(self.config, 'dev')
                # dev_maxvlue_dict = dataset_dev.max_value_dict
                collate_fn = XIAOHONGSHU_collate_fn

        # train_dataloader = DataLoader(dataset_train, batch_size=self.batch_size,
        #                               num_workers=self.num_workers,
        #                               pin_memory=True,
        #                               shuffle=True,
        #                               worker_init_fn=_init_fn,
        #                               collate_fn=collate_fn,
        #                               drop_last=True)

        test_dataloader = DataLoader(dataset_test, batch_size=self.batch_size,
                                     num_workers=self.num_workers,
                                     pin_memory=True,
                                     shuffle=False,
                                     worker_init_fn=_init_fn,
                                     collate_fn=collate_fn,
                                     drop_last=False)

        # dev_dataloader = DataLoader(dataset_dev, batch_size=self.batch_size,
        #                             num_workers=self.num_workers,
        #                             pin_memory=True,
        #                             shuffle=False,
        #                             worker_init_fn=_init_fn,
        #                             collate_fn=collate_fn,
        #                             drop_last=True)

        # dataloaders = dict(zip(['train', 'test', 'dev', 'train_maxvlue_dict', 'test_maxvlue_dict', 'dev_maxvlue_dict'],
        #                        [train_dataloader, test_dataloader, dev_dataloader, train_maxvlue_dict,
        #                         test_maxvlue_dict, dev_maxvlue_dict]))
        dataloaders = dict(zip(['test', 'test_maxvlue_dict'],
                               [test_dataloader,
                                test_maxvlue_dict]))
        return dataloaders

    def get_dataloader_temporal(self, data_type):
        collate_fn = None
        if data_type == 'SVFEND':
            dataset_train = SVFENDDataset('vid_time3_train.txt')
            dataset_val = SVFENDDataset('vid_time3_val.txt')
            dataset_test = SVFENDDataset('vid_time3_test.txt')
            collate_fn = SVFEND_collate_fn
        elif data_type == 'FANVM':
            dataset_train = FANVMDataset_train('vid_time3_train.txt')
            dataset_val = FANVMDataset_test(path_vid_train='vid_time3_train.txt', path_vid_test='vid_time3_valid.txt')
            dataset_test = FANVMDataset_test(path_vid_train='vid_time3_train.txt', path_vid_test='vid_time3_test.txt')
            collate_fn = FANVM_collate_fn
        else:
            # can be added
            print("Not available")

        train_dataloader = DataLoader(dataset_train, batch_size=self.batch_size,
                                      num_workers=self.num_workers,
                                      pin_memory=True,
                                      shuffle=True,
                                      worker_init_fn=_init_fn,
                                      collate_fn=collate_fn)
        val_dataloader = DataLoader(dataset_val, batch_size=self.batch_size,
                                    num_workers=self.num_workers,
                                    pin_memory=True,
                                    shuffle=False,
                                    worker_init_fn=_init_fn,
                                    collate_fn=collate_fn)
        test_dataloader = DataLoader(dataset_test, batch_size=self.batch_size,
                                     num_workers=self.num_workers,
                                     pin_memory=True,
                                     shuffle=False,
                                     worker_init_fn=_init_fn,
                                     collate_fn=collate_fn)

        dataloaders = dict(zip(['train', 'val', 'test'], [train_dataloader, val_dataloader, test_dataloader]))

        return dataloaders

    def get_model(self):
        if self.model_name == 'SVFEND':
            self.model = SVFENDModel(bert_model='bert-base-chinese', fea_dim=128, dropout=self.dropout)
        elif self.model_name == 'BOTTLE':
            self.model = MYMODEL(self.config)

        return self.model

    def main(self):
        print('-' * 50)
        self.model = self.get_model()
        #全局模型
        self.model.load_state_dict(torch.load("D:/weight/code/checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_all29_bs1.pth"))
        #局部模型
        # self.model.load_state_dict(torch.load("D:/weight/code/checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_icon1_bs1.pth"))
        self.model.eval()
        torch.no_grad()
        dataloaders = self.get_dataloader(data_type=self.data_type)
        trainer = Trainer(args=self.config, model=self.model, device=self.device, lr=self.lr, dataloaders=dataloaders,
                          epoches=self.epoches, dropout=self.dropout, weight_decay=self.weight_decay, mode=self.mode,
                          model_name=self.model_name, event_num=self.event_num,
                          epoch_stop=self.epoch_stop,
                          save_param_path=self.save_param_dir + self.data_type + "/" + self.model_name + "/",
                          writer=SummaryWriter(self.path_tensorboard + "/"),
                          only_test=1,
                          train_scope = self.train_scope)

        trainer.train()

        print('-' * 50)
        print('Training finished')



