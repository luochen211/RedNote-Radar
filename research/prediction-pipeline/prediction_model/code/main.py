
import argparse
import os
import random
import warnings
warnings.filterwarnings('ignore')
import numpy as np
import torch
from run import Run
# os.environ["CUDA_VISIBLE_DEVICES"]="1"
parser = argparse.ArgumentParser()
parser.add_argument('--model_name', default='BOTTLE', help='BOTTLE/SVFEND/FANVM/C3D/VGG/Bbox/Vggish/Bert/TextCNN/Comments/TikTec')
parser.add_argument('--mode_eval', default= 'cv', help='nocv/cv/temporal')
parser.add_argument('--fold', type=int,help='needed when model_eval=nocv')

parser.add_argument('--epoches', type=int, default=30)#30
parser.add_argument('--batch_size', type = int, default=1)#32
parser.add_argument('--num_workers', type=int, default=0)
parser.add_argument('--epoch_stop', type=int, default=50) #10 #20/50/100
parser.add_argument('--seed', type=int, default=2022)
parser.add_argument('--gpu', type=int, default=0)
parser.add_argument('--lr', type=float, default=0.00001) #0.0001   #0.1/0.01/0.001c
parser.add_argument('--lambd', type=float, default=0.1)
parser.add_argument('--dropout', type=float, default=0.3)#0.1
parser.add_argument('--weight_decay', type=float, default=5e-5)

# new setting
parser.add_argument('--text_dim', type=int, default=768)
parser.add_argument('--comment_dim', type=int, default=768)
parser.add_argument('--img_dim', type=int, default=4096)
parser.add_argument('--video_dim', type=int, default=4096)
parser.add_argument('--num_videoframes', type=int, default=83)
parser.add_argument('--num_audioframes', type=int, default=50)
parser.add_argument('--num_comments', type=int, default=23)
parser.add_argument('--multifea_dim', type=int, default=128)
parser.add_argument('--coattnum_heads', type=int, default=1)
parser.add_argument('--txt_length', type=int, default=128)
parser.add_argument('--train_data_split', type=int, default=0.8)
parser.add_argument('--dev_data_split', type=int, default=0.1)
parser.add_argument('--test_data_split', type=int, default=0.1)
parser.add_argument('--text_att_n_head', type=int, default=1)
parser.add_argument('--predict_size', type=int, default=1)

# factor weight
parser.add_argument('--follows', type=float, default=1)
parser.add_argument('--subscribers', type=float, default=1)
parser.add_argument('--praises', type=float, default=1)
parser.add_argument('--ttsimilarity', type=float, default=1)
parser.add_argument('--numtags', type=float, default=1)
parser.add_argument('--itsimilarity', type=float, default=1)
parser.add_argument('--readability', type=float, default=1)
parser.add_argument('--imgquality', type=float, default=1)
parser.add_argument('--titlesentiment', type=float, default=1)
parser.add_argument('--imgaesthetics', type=float, default=1)
parser.add_argument('--face', type=float, default=1)

# bottleneck
parser.add_argument('--bottleneck_head_num', default= 1, type=int, help='number of heads in the bottleneck')
parser.add_argument('--bottleneck_layer_num', default= 1, type=int, help='number of layers in the bottleneck')
parser.add_argument('--bottleneck_len', default= 20, type=int, help='length of the bottleneck')

# temporal
parser.add_argument('--temporal_layers', default=1, type=int)
parser.add_argument('--temporal_heads', default=1, type=int)

# label_norm
parser.add_argument('--label_norm', default= 'min_max_0-1', type=str, help='z_score, min_max_0-1, min_max_0-10')

#all or icon
parser.add_argument('--train_scope', default= 'icon', type=str, help='all,icon')

parser.add_argument('--path_param', default= './checkpoints/')
parser.add_argument('--path_tensorboard', default= './tb/')

args = parser.parse_args()

os.environ['CUDA_VISIBLE_DEVICES'] = str(args.gpu)

seed = args.seed
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
torch.cuda.manual_seed(seed)
torch.backends.cudnn.benchmark = False
torch.backends.cudnn.deterministic = True


if __name__ == '__main__':
    Run(config = args.__dict__).main()
