import torch
from torch import nn
import clip
import textstat
from PIL import Image
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from transformers import BertTokenizer, BertModel, BertForMaskedLM
from transformers import CLIPProcessor, CLIPModel
import json
from googletrans import Translator
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from keras.models import Model
from keras.layers import Dense, Dropout
from keras.applications.inception_resnet_v2 import InceptionResNetV2, preprocess_input

from transformers import AutoImageProcessor, ViTModel

# 预先加载BERT模型和分词器
tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
bert_model = BertModel.from_pretrained('bert-base-multilingual-cased')
predict_model = BertForMaskedLM.from_pretrained('bert-base-multilingual-cased')

# 加载VADER情感分析器
sa = SentimentIntensityAnalyzer()
translator = Translator()

# 加载 NIMA 模型
base_model = InceptionResNetV2(input_shape=(224, 224, 3), include_top=False, pooling='avg', weights=None)
x = Dropout(0.75)(base_model.output)
x = Dense(10, activation='softmax')(x)
nima_model = Model(base_model.input, x)
nima_model.load_weights('weights/inception_resnet_weights.h5')

# NIMA图像预处理
def preprocess_image(image_path):
    """ 预处理图像以适应 NIMA 模型输入 """
    img = Image.open(image_path).resize((224, 224))
    img = np.array(img)# / 255.0  # 将像素值归一化为 [0, 1]
    img = np.expand_dims(img, axis=0)  # 添加批次维度
    return preprocess_input(img)

# NIMA预测图像质量
def predict_image_quality(image_path):
    """ 使用 NIMA 模型预测图像质量分布并计算评分 """
    img = preprocess_image(image_path)
    preds = nima_model.predict(img)  # 预测图像的评分分布
    scores = np.arange(1, 11)  # 评分范围为 1-10
    quality_score = np.sum(preds * scores) / np.sum(preds)
    return quality_score

# 加载 CLIP 模型
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
# image_processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")
# vitmodel = ViTModel.from_pretrained("google/vit-base-patch16-224-in21k")


# 处理数据文件，提取特征并保存
def process_data_file(input_file_path):
    # 读取原始 JSON 数据
    output_file_path = input_file_path.replace('.json', '_feature.json')

    with open(input_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 处理每个数据项并提取特征
    for idx, item in enumerate(data):
        title_text = str(item['title'])  # 使用样本中的文本字段
        tags_text = str(item['tags'])
        if tags_text != 'nan':
            num_tags = tags_text.count(';') + 1
        else:
            num_tags = 0

        # 1. 使用BERT计算标题与标签的相似度
        with torch.no_grad():
            title_tokens = tokenizer(title_text, padding='max_length', truncation=True, max_length=128,
                                     return_tensors='pt')
            title_embeddings = bert_model(**title_tokens).last_hidden_state.mean(dim=1).detach()

            tags_list = tags_text.split(';')
            sum_cosine_similarity = 0
            for tag in tags_list:
                tag = tag.strip()
                tags_tokens = tokenizer(tag, padding='max_length', truncation=True, max_length=128, return_tensors='pt')
                tags_embeddings = bert_model(**tags_tokens).last_hidden_state.mean(dim=1).detach()
                cosine_similarity = torch.nn.functional.cosine_similarity(title_embeddings, tags_embeddings)
                sum_cosine_similarity += cosine_similarity

            if num_tags != 0 :
                if title_text != 'nan':
                    average_cosine_similarity = (sum_cosine_similarity / num_tags).item()
                else:
                    average_cosine_similarity = 0
            else:
                average_cosine_similarity = 0

            # 保存总余弦相似度和标签数量
            if isinstance(average_cosine_similarity, torch.Tensor):
                item['t_t_similarity'] = average_cosine_similarity.item()  # 如果是 Tensor，提取数值
            else:
                item['t_t_similarity'] = average_cosine_similarity  # 如果是 int，直接赋值
            # item['t_t_similarity'] = average_cosine_similarity
            item['num_tags'] = num_tags

        # 2. 用CLIP计算图文相似度


        original_image_path = item['cover']
        image_path = original_image_path.replace('./img/', '../dataset_xiaohongshu/xiaohongshu/img/')
        # fc = nn.Linear(512, 768)

        try:
            image = Image.open(image_path).convert('RGB')
            image_clip = clip_processor(images=image, return_tensors='pt').to(device)
            # image_vit = image_processor(images=image, return_tensors='pt').to(device)
            sum_similarity = 0
            for tag in tags_list:
                tag = tag.strip()
                tags_tokens = tokenizer(tag, padding='max_length', truncation=True, max_length=128, return_tensors='pt')
                tags_embeddings = bert_model(**tags_tokens).last_hidden_state.mean(dim=1).detach()

                with torch.no_grad():
                    # text_features = model.encode_text(text).float()
                    image_features = clip_model.get_image_features(**image_clip).float()
                    # image_features = vitmodel(**image_vit).last_hidden_state.mean(dim=1).detach()

                similarity = torch.nn.functional.cosine_similarity(tags_embeddings, image_features)
                print(similarity)
                sum_similarity += similarity

            if num_tags != 0:
                average_image_similarity = sum_similarity / num_tags
            else:
                average_image_similarity = 0

            if average_image_similarity < 0:
                print('出现负数了')
                print(average_image_similarity)
            if isinstance(average_image_similarity, torch.Tensor):
                item['i_t_similarity'] = average_image_similarity.item()
            else:
                item['i_t_similarity'] = average_image_similarity

            # item['i_t_similarity'] = average_image_similarity.item()

        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            item['i_t_similarity'] = None

        # 3. 计算title文本可读性
        # if title_text != 'nan':
        #     FOG = textstat.gunning_fog(title_text)
        #     item['readability'] = FOG
        # else:
        #     item['readability'] = 0

        # 4. 用NIMA模型评估图像质量
        try:
            image_quality_score = predict_image_quality(image_path)
            item['image_quality_score'] = image_quality_score
            # print(f"Image Quality Score for {image_path}: {image_quality_score}")
        except Exception as e:
            print(f"Error processing {image_path} for NIMA: {e}")
            item['image_quality_score'] = None

        # 5. VADER情感分析
        if title_text != 'nan':
            translated_text = translator.translate(title_text, src='zh-cn', dest='en').text
            sentiment_scores = sa.polarity_scores(translated_text)
            FOG = textstat.gunning_fog(translated_text)
            item['readability'] = FOG
            item['title_sentiment'] = sentiment_scores['compound']
        else:
            item['title_sentiment'] = 0#没有视为中性 0
            item['readability'] = 0#没有视为最简单0

    # 将处理后的数据写入新的JSON文件
    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"Saved output data with features to {output_file_path}")

if __name__ == '__main__':
    train_file_path = './train_data.json'
    test_file_path = './test_data.json'
    val_file_path = './val_data.json'

    data_name = [train_file_path, test_file_path, val_file_path]

    for file_name in data_name:
        process_data_file(file_name)
