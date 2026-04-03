# 东方色彩美学与文化倾向分析

本项目用于分析视频笔记中的色彩协调性、丰富度、适配度以及文化倾向（东方/西方/现代）。

## 目录结构
- `Culture.py`: 分析图像的文化倾向（使用 CLIP 模型）。
- `Harmony.py`: 分析图像的色彩和谐度（基于五色体系与五行生克）。
- `Richness.py`: 分析图像的色彩丰富度与五色占比。
- `Adaptation.py`: 分析视频的色彩方位适配性（基于 Richness.py 的输出）。
- `scene/`: 存放包含视频帧图片的文件夹（文件夹名为笔记ID）。
- `dependencies/`: 存放依赖配置文件。
- `Data_demo.csv`: 项目的主数据文件（示例数据）。

## 环境安装

请确保安装 Python 3.8+。
进入项目根目录，运行以下命令安装依赖：

```bash
pip install -r dependencies/requirements.txt
```

## 运行说明

确保 `scene` 文件夹中包含需要分析的图片（按笔记ID分类），并且 `Data_demo.csv` 中包含对应的笔记ID记录。

依次运行以下脚本：

1. **色彩丰富度分析**
   ```bash
   python Richness.py
   ```
   输出：`Data_demo_Richness_Optimized.csv`

2. **色彩和谐度分析**
   ```bash
   python Harmony.py
   ```
   输出：`Data_demo_TOPSIS_sheng.csv`

3. **文化倾向分析**
   ```bash
   python Culture.py
   ```
   输出：`scene_culture_analysis_aggregated.csv`

4. **色彩方位适配性分析**
   > 注意：此脚本依赖于 `Richness.py` 的输出结果 (`Data_demo_Richness_Optimized.csv`)。
   ```bash
   python Adaptation.py
   ```
   输出：`Data_demo_Adaptation.csv`

## 注意事项
- `Culture.py` 需要加载 CLIP 模型，建议有 GPU 环境。
- 脚本运行过程中会读取 `scene` 目录下的图片数据，请确保包括完整的图片文件。

## 输出结果说明

每个脚本运行后生成的 CSV 文件包含以下关键字段：

### 1. Richness.py 输出 (`Data_demo_Richness_Optimized.csv`)
- **Prop_Black**: 黑色在视频画面中的平均占比。
- **Prop_White**: 白色在视频画面中的平均占比。
- **Prop_Chi**: 赤色（红）在视频画面中的平均占比。
- **Prop_Huang**: 黄色在视频画面中的平均占比。
- **Prop_Qing**: 青色（蓝/绿）在视频画面中的平均占比。
- **Prop_Other**: 其他颜色（无法归类为五色）的平均占比。
- **Richness**: 五色丰富度指标，表示画面中占比超过阈值（0.05）的五色类别数量（0-5）。

### 2. Harmony.py 输出 (`Data_demo_TOPSIS_sheng.csv`)
- **Harmony**: 静态色彩和谐度得分。基于单帧图像中主要颜色的五行相生相克关系计算得出（0-10分），分数越高表示色彩搭配越和谐。

### 3. Adaptation.py 输出 (`Data_demo_Adaptation.csv`)
- **Adaptation_Score**: 色彩方位适配度。计算视频的五色分布向量与该地区（IP归属地）对应的传统方位主色向量之间的余弦相似度。

### 4. Culture.py 输出 (`scene_culture_analysis_aggregated.csv`)
- **M_Culture_Polarity**: 东方文化极性概率。表示画面更倾向于东方文化风格的概率（0-1），值越接近 1 表示越具有东方特色。
- **Control_Modern_Norm**: 归一化后的现代风格得分。
- **Score_East_Norm**: 归一化后的东方文化元素得分。
- **Score_West_Norm**: 归一化后的西方文化元素得分。
- **Raw_Diff**: 东方得分与西方得分的原始差值（East - West）。
- **Score_East_Raw**: 东方文化元素的原始得分。
- **Score_West_Raw**: 西方文化元素的原始得分。
- **Score_Modern_Raw**: 现代风格的原始得分。
