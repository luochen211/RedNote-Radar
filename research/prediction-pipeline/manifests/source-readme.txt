数据处理：
视频处理：
1）.提取关键帧"D:\szz_featureextraction\video_to_key-image\keyframes_extract_diff.py"
149与151行修改数据路径即可：
    VIDEO_PATH = "D:/szz_featureextraction/icon_data/video/video/"
    OUTPUT_DIR = "D:/szz_featureextraction/icon_data/keyframes/"
2）.提取视频帧特征"D:\szz_featureextraction\2.提取视频帧特征.py"
70与71行修改数据路径即可：
input_folder = 'D:/szz_featureextraction/icon_data/keyframes/'
output_folder = 'D:/szz_featureextraction/icon_data/video_feature/'

音频处理：
1）背景音频提取"D:\szz_featureextraction\3.从视频提取音频.py"
28与29行修改数据路径即可：
video_path = 'D:/szz_featureextraction/icon_data/video/video'
audio_output_path = 'D:/szz_featureextraction/icon_data/audio'
2）音频特征提取"D:\szz_featureextraction\4.提取音频特征.py"
14与16路径
audio_folder = 'D:/szz_featureextraction/icon_data/audio'
# audio_folder = 'F:\mj\polyuproject\mmvideo\dataset_xiaohongshu\xiaohongshu\error_audios'
output_folder = "D:/szz_featureextraction/icon_data/audio_fea"

提取一系列数值特征（封面图片美学/质量/人脸；视频美学分数；文本情感/可读性；标题-图片一致性；标题-标签一致性）——既是后续预测参与度分数的输入，也是网页在分析页展示的部分指标
1）封面图片质量；文本情感/可读性；标题-图片一致性；标题-标签一致性"D:\zyj_exceltojason\feature_extraction4-finalversion.py"
image_path = original_image_path.replace('./img/', 'D:/szz_featureextraction/icon_data/img/img/') #修改封面图片的路径
    train_file_path = './icon_data.json'  # 输入路径，
output_file_path = input_file_path.replace('.json', '_feature.json')  #输出路径
此外，该部分涉及到一些预训练模型导入路径：
tokenizer = BertTokenizer.from_pretrained('D:/weight/bert/')
bert_model = BertModel.from_pretrained('D:/weight/bert/')
predict_model = BertForMaskedLM.from_pretrained('D:/weight/bert/')
nima_model.load_weights('weights/inception_resnet_weights.h5')
model, preprocess = clip.load("ViT-B/32", device=device)

2）封面图片美学分数"D:\szz_featureextraction\deep-photo-aesthetics-master\extract_score_szz_v1.py"
    base_img_dir = r"D:/szz_featureextraction/icon_data/img/img"  #修改封面图片的路径
    json_path = 'D:/zyj_exceltojason/icon_data_feature.json'  # 原始JSON文件路径 （无美学分数）
    output_json = 'icon_data_with_aesthetic.json'  # 输出包含美学分数的json路径

3）视频美学分数"D:\szz_featureextraction\deep-photo-aesthetics-master\video_aesthetic.py"
    base_img_dir = r"D:\szz_featureextraction\icon_data\keyframes"  # 视频的关键帧根目录
    json_path = 'D:/zyj_exceltojason/icon_data_feature.json'  # 原始JSON文件路径
    output_json = 'icon_data_with_video_aesthetic.json'  # 输出包含视频美学分数的文件路径

4）人脸"D:\szz_featureextraction\face_reg.py"
    base_img_dir = r"D:/szz_featureextraction/icon_data/img/img"  #修改封面图片的路径
    json_path = 'D:/szz_featureextraction/deep-photo-aesthetics-master/icon_data_with_aesthetic.json'  # 原始JSON文件路径（无人脸特征）
    output_json = 'icon_data_all.json'   #包含人脸特征的json文件输出路径


1.环境配置
主要库及其版本
gensim==4.2.0
huggingface-hub==0.5.1
ipykernel==6.13.0
ipython==8.3.0
jieba==0.42.1
librosa==0.7.2
opencv-python==4.6.0.66
pandas==1.4.2
Pillow==9.1.0
python==3.8.5
python3-openid==3.2.0
pytorch-lightning==1.6.2
pytorch-ranger==0.1.1
tensorboard==2.9.0
tensorboard-data-server==0.6.1
tensorboard-plugin-wit==1.8.1
tensorboardX==2.2
torch==1.10.1  （GPU）
torch-optimizer==0.3.0
torch-stoi==0.1.2
torchaudio==0.11.0
torchmetrics==0.8.1
torchvision==0.11.2
transformers==4.18.0
scikit-learn==1.0.2
scipy==1.8.1
timm==0.5.4
tokenizers==0.12.1
tqdm==4.64.0
2.由于项目目前都是绝对地址，所以可能需要修改数据输入地址
1）模型载入：onlytest.py文件513行
self.model.load_state_dict(torch.load("D:/weight/code/checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_all29_bs1.pth"))
2）数据载入：dataloader.py

            self.xiaohongshu_json_path = r'D:/weight/xiaohongshu_.json'
            self.icondata_path = r"D:/szz_featureextraction/icon_data_1.json"

            self.xiaohongshu_json_path = r'D:/weight/xiaohongshu_likes_le30_no_icon.json'
            self.icondata_path = r"D:/szz_featureextraction/icon_data_all.json"
       ###以上两组路径都是用户输入的地址，实际运用中两者选其一修改即可（或者直接保持一致）

        self.video_features_path = r'D:/weight/videos_frames_features_'  #视频特征
        self.audio_features_path = r'D:/weight/audios_features_'   #音频特征
        self.wo_audio_features_path = r'D:/weight/wo_bgm_video'  %背景音特征
     ###以上三个是我们从用户数据中预先提取的特征

3)预训练bert模型载入：SVFEND.py
        self.tokenizer = AutoTokenizer.from_pretrained('D:/weight/bert/')
        self.bert = BertModel.from_pretrained('D:/weight/bert/').requires_grad_(False)

3.运行only_test-main.py文件
预测结果输出位置：Trainer.py 第76行的变量 tpred
注意：本模型输出结果对应的是网页中预测结果页中的  
  - Engagement score prediction (Local scope)：基于 Hotel Icon 历史点赞分布，预测相对本账号高参与概率。  
  - Engagement score prediction (Global scope)：基于全体酒店官方账号点赞分布，预测达成行业领先的概率。
这里需要设置一个参数：only_test-main.py文件中
parser.add_argument('--train_scope', default= 'all', type=str, help='all,icon')
该参数设置为all，即加载BOTTLE_best_all29_bs1.pth模型，输出全局分数
self.model.load_state_dict(torch.load("D:/weight/code/checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_all29_bs1.pth"))
该参数设置为icon，即加载BOTTLE_best_icon1_bs1.pth模型，输出全局分数
self.model.load_state_dict(torch.load("D:/weight/code/checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_icon0_bs1_new.pth"))

但在实际运行过程中，用户上传一组数据，我们需要给出两个预测结果（局部+全局）。因此，总体流程为：
用户上传数据---运行两次模型，分别导入两个模型（BOTTLE_best_all29_bs1.pth与BOTTLE_best_icon1_bs1.pth）---输出两个结果


示例数据为：
"D:\szz_featureextraction\icon_data_1.json"  #前面提取的数值特征（封面图片美学/质量/人脸；视频美学分数；文本情感/可读性；标题-图片一致性；标题-标签一致性）
"D:\weight\wo_bgm_video\684d648e000000002300077e.mp4"  #BGM特征
"D:\weight\videos_frames_features_\684d648e000000002300077e.pkl" #视频特征
"D:\weight\audios_features_\684d648e000000002300077e.pkl" #音频特征