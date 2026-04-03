import json
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertModel, BertForMaskedLM
from transformers import ViTFeatureExtractor, ViTModel
from PIL import Image

class CorrDataloader(Dataset):
    def __init__(self, json_file):
        # 读取JSON文件中的数据
        with open(json_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

        # 初始化特征提取和预测模型
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
        self.bert_model = BertModel.from_pretrained('bert-base-multilingual-cased')
        self.predict_model = BertForMaskedLM.from_pretrained('bert-base-multilingual-cased')
        self.vit_feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
        self.vit_model = ViTModel.from_pretrained('google/vit-base-patch16-224')



    def __len__(self):
        # 返回数据集的长度
        return len(self.data)

    def __getitem__(self, idx):
        # 获取指定索引的数据
        sample = self.data[idx]

        # 转换数值字段为整数
        sample['follows'] = int(sample['follows'])
        sample['subscribers'] = int(sample['subscribers'])
        sample['praises'] = int(sample['praises'])
        sample['likes'] = int(sample['likes'])
        sample['favors'] = int(sample['favors'])
        sample['comments'] = int(sample['comments'])
        sample['shares'] = int(sample['shares'])

        # 对文本进行BERT的标记化处理
        title_text = str(sample['title']) # 使用样本中的文本字段
        tags_text = str(sample['tags'])

        title_tokens = self.tokenizer(title_text, padding='max_length', truncation=True, max_length=128, return_tensors='pt')
        title_embeddings = self.bert_model(**title_tokens).last_hidden_state.mean(dim=1)  # 获取title的嵌入

        tags_list = tags_text.split(';')
        tags_similarities = {}
        for tag in tags_list:
            tag = tag.strip()
            if tag:
                tags_tokens = self.tokenizer(tag, padding='max_length', truncation=True, max_length=128,
                                              return_tensors='pt')
                tags_embeddings = self.bert_model(**tags_tokens).last_hidden_state.mean(dim=1)  # 获取tags的嵌入

                each_cosine_similarity = torch.nn.functional.cosine_similarity(title_embeddings, tags_embeddings)
                tags_similarities[tag] = each_cosine_similarity.item()

        #提取视频特征
        original_image_path = self.data[idx]['cover']
        image_path = original_image_path.replace('./img/', '../dataset_xiaohongshu/xiaohongshu/img/')
        image = Image.open(image_path).convert('RGB')
        image_inputs = self.vit_feature_extractor(images=image, return_tensors='pt')

        with torch.no_grad():
            image_outputs = self.vit_model(**image_inputs)
            image_feature = image_outputs.last_hidden_state[:, 0, :]

        i_t_cosine_similarity = torch.nn.functional.cosine_similarity(title_embeddings, image_feature)


        #计算困惑度
        inputs = title_tokens

        input_ids = inputs['input_ids']
        attention_mask = inputs['attention_mask']

        with torch.no_grad():
            outputs = self.predict_model(input_ids=input_ids, attention_mask=attention_mask, labels=input_ids)

        loss = outputs.loss

        perplexity = torch.exp(loss)


        # 返回数值特征和标记化的文本
        return {
            'follows': torch.tensor(sample['follows'], dtype=torch.long),
            'subscribers': torch.tensor(sample['subscribers'], dtype=torch.long),
            'praises': torch.tensor(sample['praises'], dtype=torch.long),
            'likes': torch.tensor(sample['likes'], dtype=torch.long),
            'favors': torch.tensor(sample['favors'], dtype=torch.long),
            'comments': torch.tensor(sample['comments'], dtype=torch.long),
            'shares': torch.tensor(sample['shares'], dtype=torch.long),
            'title_input_ids': title_tokens['input_ids'].squeeze(0),  # BERT的input_ids
            'title_input_mask': title_tokens['attention_mask'].squeeze(0),
            'tags_input_ids': tags_tokens['input_ids'].squeeze(0),
            'tags_attention_mask': tags_tokens['attention_mask'].squeeze(0),
            'title': title_text,
            'tags': tags_text,
            'cosine_similarity': tags_similarities,
            'perplexity': perplexity.item(),
            'i_t_cosine_similarity': i_t_cosine_similarity.item()
        }

# 创建DataLoader
def create_dataloader(json_file, batch_size=32, shuffle=True):
    dataset = CorrDataloader(json_file)
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, collate_fn=custom_collate_fn)

def custom_collate_fn(batch):
    # 获取 batch 中所有键的集合
    batch_keys = batch[0].keys()

    # 为每个键生成一个批次的列表
    collated_batch = {key: [] for key in batch_keys}

    for item in batch:
        for key in item:
            collated_batch[key].append(item[key])

    return collated_batch

if __name__ == '__main__':
    train_file_path = './train_data.json'
    test_file_path = './test_data.json'
    val_file_path = './val_data.json'

    train_dataloader = create_dataloader(train_file_path)
    test_dataloader = create_dataloader(test_file_path)
    val_dataloader = create_dataloader(val_file_path)

    # 迭代DataLoader并打印每个批次的数据
    for batch in train_dataloader:
        # for i in range(len(batch['cosine_similarity'])):
        for i in range(len(batch['follows'])):
            print(f"Title: {batch['title'][i]}")
            print(f"Tags: {batch['tags'][i]}")
            print(f"Cosine Similarity for each tag: {batch['cosine_similarity'][i]}")
            print(f"Perplexity: {batch['perplexity'][i]}")
            print(f'图文余弦相似度: {batch["i_t_cosine_similarity"][i]}')
            print("=" * 30)
