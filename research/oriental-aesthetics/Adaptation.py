# -*- coding: utf-8 -*-
"""
基于地区方位主色与视频五色占比计算余弦相似度
"""

import os
import numpy as np
import pandas as pd

# --------- 配置参数 ---------

# 颜色索引 [黑, 白, 赤, 黄, 青]
# 对应 Richness.py 输出的列名: Prop_Black, Prop_White, Prop_Chi, Prop_Huang, Prop_Qing
COLOR_COLUMNS = ["Prop_Black", "Prop_White", "Prop_Chi", "Prop_Huang", "Prop_Qing"]
COLOR_INDEX = {"黑": 0, "白": 1, "赤": 2, "黄": 3, "青": 4}

N_COLORS = 5

# 权重设置：主色占 0.6，其余 4 色平分剩余 0.4
MAIN_COLOR_WEIGHT = 0.6
OTHER_WEIGHT = (1.0 - MAIN_COLOR_WEIGHT) / (N_COLORS - 1)

# 地区 -> 方位主色映射表
REGION_MAIN_COLOR = {
    "北京": "黄", "湖北": "黄", "湖南": "黄",
    "江苏": "青", "上海": "青", "浙江": "青",
    "广东": "赤", "香港": "赤", "澳门": "赤", "海南": "赤",
    "四川": "白", "重庆": "白", "陕西": "白",
}


# --------- 核心函数 ---------

def build_ori_vector(main_color: str) -> np.ndarray:
    """构建标准方位向量 (主色权重0.6，其余平分)"""
    vec = np.full(N_COLORS, OTHER_WEIGHT, dtype=float)
    if main_color in COLOR_INDEX:
        vec[COLOR_INDEX[main_color]] = MAIN_COLOR_WEIGHT
    return vec


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """计算两个向量的余弦相似度"""
    if np.any(np.isnan(a)) or np.any(np.isnan(b)):
        return np.nan

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return np.nan

    return float(np.dot(a, b) / (norm_a * norm_b))


# --------- 主流程 ---------

def main():
    # 输入文件应该是 Richness.py 的输出文件
    input_file = "Data_demo_Richness_Optimized.csv"
    output_file = "Data_demo_Adaptation.csv"

    if not os.path.exists(input_file):
        print(f"错误: 找不到输入文件 {input_file}。请先运行 Richness.py。")
        return

    print(f"读取数据: {input_file}")
    try:
        df = pd.read_csv(input_file, encoding="utf-8-sig")
    except UnicodeDecodeError:
        df = pd.read_csv(input_file, encoding="gbk")

    # 检查必要列是否存在
    if "ip归属地" not in df.columns:
        print("错误: 数据中缺少 'ip归属地' 列")
        return
    
    for col in COLOR_COLUMNS:
        if col not in df.columns:
            print(f"错误: 数据中缺少 '{col}' 列。请确保运行了 Richness.py。")
            return

    results = []

    for i in range(len(df)):
        region_raw = df.iloc[i]["ip归属地"]
        region = str(region_raw).strip() if pd.notna(region_raw) else ""

        # 获取视频颜色向量
        vec_video = df.iloc[i][COLOR_COLUMNS].values.astype(float)

        # 计算逻辑：仅当地区有效且颜色数据完整时计算
        if region in REGION_MAIN_COLOR and not np.isnan(vec_video).any():
            vec_standard = build_ori_vector(REGION_MAIN_COLOR[region])
            sim = cosine_similarity(vec_video, vec_standard)
        else:
            sim = np.nan

        results.append(sim)

    # 保存结果
    df["Adaptation_Score"] = results
    df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"处理完成，结果已保存至: {output_file}")


if __name__ == "__main__":
    main()