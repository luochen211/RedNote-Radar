import os
import cv2
import numpy as np
import pandas as pd


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
        return "Black"
    if s_norm <= 0.18 and v_norm >= 0.86:
        return "White"

    # 2. 有彩色判定
    if h >= 253.63 or h < 12.26:
        return "Chi"
    if 13.46 <= h <= 45.86:
        return "Huang"
    if 67.47 <= h <= 204.16:
        return "Qing"

    return "Other"


# ==========================================
# 2. 单帧色彩占比分析
# ==========================================
def analyze_frame_proportions(img_bgr):
    """
    计算单帧中五色及其他颜色的占比
    """
    if img_bgr is None:
        return None

    # 缩放至 100x100 提高速度且保留区域特征
    img_small = cv2.resize(img_bgr, (100, 100), interpolation=cv2.INTER_AREA)

    img_hsv = cv2.cvtColor(img_small, cv2.COLOR_BGR2HSV)
    pixels = img_hsv.reshape(-1, 3)

    color_counts = {
        "Black": 0, "White": 0, "Chi": 0, "Huang": 0, "Qing": 0, "Other": 0
    }

    for p in pixels:
        # OpenCV H 转标准 H
        h_std = int(p[0]) * 2
        category = hsv_to_wuse((h_std, p[1], p[2]))
        color_counts[category] += 1

    total = len(pixels)
    if total == 0: return None

    # 计算占比
    proportions = {k: v / total for k, v in color_counts.items()}
    return proportions


# ==========================================
# 3. 视频处理主流程
# ==========================================
def compute_video_richness(scene_folder):
    scene_files = [os.path.join(scene_folder, f)
                   for f in os.listdir(scene_folder)
                   if f.lower().endswith((".jpg", ".png", ".jpeg"))]

    if not scene_files:
        return None

    frame_props_list = []

    print(f"📂 Processing Richness: {scene_folder} ({len(scene_files)} scenes)")

    for scene_path in scene_files:
        try:
            img = cv2.imread(scene_path)
            props = analyze_frame_proportions(img)
            if props:
                frame_props_list.append(props)
        except Exception as e:
            print(f"  Error reading {scene_path}: {e}")

    if not frame_props_list:
        return None

    # 计算全视频平均占比
    avg_props = {
        "Black": 0.0, "White": 0.0, "Chi": 0.0, "Huang": 0.0, "Qing": 0.0, "Other": 0.0
    }

    count = len(frame_props_list)
    for p in frame_props_list:
        for k in avg_props:
            avg_props[k] += p[k]

    for k in avg_props:
        avg_props[k] /= count

    # 计算五色数量 (Richness)
    TAU = 0.05
    nc = 0
    five_colors = ["Black", "White", "Chi", "Huang", "Qing"]

    dominant_list = []
    for c in five_colors:
        if avg_props[c] > TAU:
            nc += 1
            dominant_list.append(c)

    result = avg_props.copy()
    result['Richness'] = nc

    print(f"  -> Richness: {nc}, Dominant: {dominant_list}")
    return result


# ==========================================
# 4. 批处理入口
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

        richness_data = []

        total_rows = len(df)
        print(f"Start processing {total_rows} items...")

        for index, row in df.iterrows():
            note_id = str(row.get("笔记id", "")).strip()
            folder = os.path.join(scene_base_folder, note_id)

            default_res = {k: None for k in ["Black", "White", "Chi", "Huang", "Qing", "Other", "Richness"]}

            if os.path.exists(folder):
                res = compute_video_richness(folder)
                if res:
                    richness_data.append(res)
                else:
                    zero_res = {k: 0.0 for k in ["Black", "White", "Chi", "Huang", "Qing", "Other"]}
                    zero_res["Richness"] = 0
                    richness_data.append(zero_res)
            else:
                richness_data.append(default_res)

            if (index + 1) % 50 == 0:
                print(f"--- Processed {index + 1}/{total_rows} ---")

        richness_df = pd.DataFrame(richness_data)
        # 重命名列: Prop_Black, ... Prop_Other, Richness
        richness_df.columns = [f"Prop_{c}" if c != 'Richness' else 'Richness' for c in richness_df.columns]

        df_final = pd.concat([df, richness_df], axis=1)

        out_path = csv_path.replace(".csv", "_Richness_Optimized.csv")
        df_final.to_csv(out_path, index=False, encoding="utf-8-sig")
        print(f"✅ All Done. Saved to {out_path}")
    else:
        print(f"❌ CSV file not found: {csv_path}")