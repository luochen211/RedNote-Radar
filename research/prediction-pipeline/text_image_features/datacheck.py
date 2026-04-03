import json
import numpy as np


def datacheck(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # 初始化用于存储数值特征的字典
    print('----------------以下是{}的数据统计----------------'.format(file_path))
    numerical_features = {
        'follows': [],
        'subscribers': [],
        'praises': [],
        'likes': [],
        'favors': [],
        'comments': [],
        'shares': [],
        't_t_similarity': [],
        'num_tags': [],
        'i_t_similarity': [],
        'image_quality_score': [],
        'title_sentiment': [],
        'readability': []
    }

    # 遍历数据并提取数值特征
    for item in data:
        for key in numerical_features.keys():
            value = item.get(key)
            try:
                # 尝试将值转换为浮点数，并将有效数值添加到列表中
                if value is not None:
                    numerical_features[key].append(float(value))
            except ValueError:
                print(f"警告: '{key}' 字段中存在无法转换为数值的数据: {value}")

    # 计算每个特征的最大值、最小值、平均值，并检查 None 值
    stats = {}
    for key, values in numerical_features.items():
        if values:
            values = np.array(values, dtype=np.float64)
            max_value = np.max(values)
            min_value = np.min(values)
            mean_value = np.mean(values)
            has_none = any(val is None for val in values)

            stats[key] = {
                'max': max_value,
                'min': min_value,
                'mean': mean_value,
                'has_none': has_none
            }
        else:
            stats[key] = {
                'max': None,
                'min': None,
                'mean': None,
                'has_none': True
            }

    # 输出统计结果
    for feature, values in stats.items():
        print(
            f"{feature}: 最大值 = {values['max']}, 最小值 = {values['min']}, 平均值 = {values['mean']}, 存在 None = {values['has_none']}")
    print('----------------{}数据统计结束----------------'.format(file_path))


if __name__ == '__main__':
    train_file_path = './train_data_feature.json'
    test_file_path = './test_data_feature.json'
    val_file_path = './val_data_feature.json'

    data_name = [train_file_path, test_file_path, val_file_path]

    for file_name in data_name:
        datacheck(file_name)
