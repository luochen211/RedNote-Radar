# Original Local Notes

The following notes are a direct cleanup of the local `1.预测页代码与部分分析页代码/readme.txt`.

## 数据处理

### 视频处理
1. 提取关键帧
   - Script: `feature_extraction/video_to_key-image/keyframes_extract_diff.py`
2. 提取视频帧特征
   - Script: `feature_extraction/2.提取视频帧特征.py`

### 音频处理
1. 从视频提取背景音频
   - Script: `feature_extraction/3.从视频提取音频.py`
2. 提取音频特征
   - Script: `feature_extraction/4.提取音频特征.py`

### 数值特征提取
1. 封面图片质量、文本情感/可读性、标题-图片一致性、标题-标签一致性
   - Script: `text_image_features/feature_extraction4-finalversion.py`
2. 封面图片美学分数
   - Script: `feature_extraction/deep-photo-aesthetics-master/extract_score_szz_v1.py`
3. 视频美学分数
   - Script: `feature_extraction/deep-photo-aesthetics-master/video_aesthetic.py`
4. 人脸检测
   - Script: `feature_extraction/face_reg.py`

### 预测输出
1. 预测主入口
   - Scripts:
     - `prediction_model/code/only_test-main.py`
     - `prediction_model/code/onlytest.py`
2. 需要分别运行局部与全局两套模型，得到网页预测页中的两个 engagement score。

## 原始环境说明

The local notes reference absolute Windows paths such as `D:/...` for:
- BERT tokenizer/model loading
- JSON inputs
- extracted video/audio feature tensors
- checkpoint selection for local/global prediction

These absolute paths were not rewritten in the archived code. Treat this export as a reference snapshot rather than a ready-to-run package.
