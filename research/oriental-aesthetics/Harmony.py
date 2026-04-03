import os
import cv2
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score


# ==========================================
# 1. 五色判定逻辑
# ==========================================
def hsv_to_wuse(hsv_tuple):
    """
    将 HSV 值映射到五色类别。
    """
    h, s, v = hsv_tuple

    # 归一化 S, V 到 [0, 1]
    s_norm = s / 255.0
    v_norm = v / 255.0

    # 1. 无彩色判定
    if v_norm <= 0.30:
        return "黑色"
    if s_norm <= 0.18 and v_norm >= 0.86:
        return "白色"

    # 2. 有彩色判定
    if h >= 253.63 or h < 12.26:
        return "赤色"
    if 13.46 <= h <= 45.86:
        return "黄色"
    if 67.47 <= h <= 204.16:
        return "青色"

    return "其它颜色"


# ==========================================
# 2. 五行关系判定逻辑
# ==========================================
def get_wuxing_relation(color1, color2):
    """
    判定两个颜色之间的五行关系
    返回: 0-相生, 1-同色, 2-相胜, 3-无关
    """
    if color1 == "其它颜色" or color2 == "其它颜色":
        return 3

    if color1 == color2:
        return 1

    sheng_map = {
        "青色": "赤色", "赤色": "黄色", "黄色": "白色", "白色": "黑色", "黑色": "青色"
    }
    sheng_ke_map = {
        "青色": "黄色", "黄色": "黑色", "黑色": "赤色", "赤色": "白色", "白色": "青色"
    }

    if sheng_map.get(color1) == color2 or sheng_map.get(color2) == color1:
        return 0

    if sheng_ke_map.get(color1) == color2 or sheng_ke_map.get(color2) == color1:
        return 2

    return 3


# ==========================================
# 3. TOPSIS 计算核心
# ==========================================
def calculate_topsis_score(relation_dist):
    """
    基于分布向量计算 TOPSIS 得分
    """
    # 权重向量 [相生, 同色, 相胜, 无关]
    W = np.array([0.4, 0.3, 0.1, 0.2])

    # 加权规范化
    Z = np.array(relation_dist) * W

    # 理想解定义 (相生 vs 相胜)
    A_plus = np.array([W[0], 0, 0, 0])
    A_minus = np.array([0, 0, W[2], 0])

    # 欧氏距离计算
    D_plus = np.sqrt(np.sum((Z - A_plus) ** 2))
    D_minus = np.sqrt(np.sum((Z - A_minus) ** 2))

    # 贴近度
    if D_plus + D_minus == 0:
        return 0
    C = D_minus / (D_plus + D_minus)

    # 映射到 0-10 分
    return C * 10


# ==========================================
# 4. 图像处理与特征提取
# ==========================================
def analyze_frame_static(img_bgr):
    """
    分析单帧的静态协调性 (Intra-shot)
    """
    if img_bgr is None:
        return 0, "其它颜色"

    # 缩放至 100x100 提高处理速度
    img_small = cv2.resize(img_bgr, (100, 100), interpolation=cv2.INTER_AREA)

    img_hsv = cv2.cvtColor(img_small, cv2.COLOR_BGR2HSV)
    sample_pixels = img_hsv.reshape(-1, 3)

    # 自适应 K-means
    best_k = 2
    best_score = -1

    unique_colors = len(np.unique(sample_pixels, axis=0))
    if unique_colors < 2:
        avg_color = np.mean(sample_pixels, axis=0)
        dom_color = hsv_to_wuse((avg_color[0] * 2, avg_color[1], avg_color[2]))
        return 0, dom_color

    for k in range(2, min(6, unique_colors + 1)):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=3).fit(sample_pixels)
        labels = kmeans.labels_
        if len(set(labels)) < 2: continue

        score = silhouette_score(sample_pixels, labels, sample_size=2000)

        if score > best_score:
            best_score = score
            best_k = k

    # 最佳 K 聚类
    kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=3).fit(sample_pixels)
    centers = kmeans.cluster_centers_
    counts = np.bincount(kmeans.labels_)
    total_pixels = sum(counts)

    sorted_indices = np.argsort(counts)[::-1]

    # 构建关系分布向量
    relation_dist = np.zeros(4)

    main_idx = sorted_indices[0]
    main_hsv = centers[main_idx]
    main_color = hsv_to_wuse((main_hsv[0] * 2, main_hsv[1], main_hsv[2]))

    weight_sum = 0
    for i in range(1, len(sorted_indices)):
        idx = sorted_indices[i]
        sec_hsv = centers[idx]
        sec_color = hsv_to_wuse((sec_hsv[0] * 2, sec_hsv[1], sec_hsv[2]))

        weight = counts[idx] / total_pixels
        rel_idx = get_wuxing_relation(main_color, sec_color)

        relation_dist[rel_idx] += weight
        weight_sum += weight

    if weight_sum > 0:
        relation_dist /= weight_sum
    else:
        relation_dist[1] = 1.0

    score = calculate_topsis_score(relation_dist)
    return score, main_color


# ==========================================
# 5. 视频处理主流程
# ==========================================
def compute_video_harmony(scene_folder):
    scene_files = [os.path.join(scene_folder, f)
                   for f in os.listdir(scene_folder)
                   if f.lower().endswith((".jpg", ".png", ".jpeg"))]
    scene_files.sort()

    if not scene_files:
        return None

    print(f"📂 Processing: {scene_folder} ({len(scene_files)} scenes)")

    static_scores = []

    # 计算每一帧的静态分数
    for scene_path in scene_files:
        try:
            img = cv2.imread(scene_path)
            if img is None: continue

            score, _ = analyze_frame_static(img)
            static_scores.append(score)

        except Exception as e:
            print(f"  Error reading {scene_path}: {e}")

    # 全局聚合
    F_static = np.mean(static_scores) if static_scores else 0

    print(f"📊 Result -> Harmony: {F_static:.2f}")
    return F_static


# ==========================================
# 6. 批处理入口
# ==========================================
if __name__ == "__main__":
    # 配置路径
    csv_path = "Data_demo.csv"
    scene_base_folder = "scene"

    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path, encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(csv_path, encoding="gbk")

        results_harmony = []

        total_rows = len(df)
        print(f"Start processing {total_rows} items...")

        for index, row in df.iterrows():
            note_id = str(row.get("笔记id", "")).strip()
            folder = os.path.join(scene_base_folder, note_id)

            if os.path.exists(folder):
                score = compute_video_harmony(folder)
                results_harmony.append(score)
            else:
                results_harmony.append(None)

            if (index + 1) % 50 == 0:
                print(f"--- Processed {index + 1}/{total_rows} ---")

        df["Harmony"] = results_harmony

        out_path = csv_path.replace(".csv", "_TOPSIS_sheng.csv")
        df.to_csv(out_path, index=False, encoding="utf-8-sig")
        print(f"✅ All Done. Saved to {out_path}")
    else:
        print(f"❌ CSV file not found: {csv_path}")