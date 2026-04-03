import os
import torch
import pandas as pd
import numpy as np
from PIL import Image
from cn_clip.clip import load_from_name, tokenize

# 1. 路径与设置
scene_dir = "scene"
output_csv = "scene_culture_analysis_aggregated.csv"

# 参数设置
use_scene_prompts = True
similarity_mode = "topk"
top_k = 50

device = "cuda" if torch.cuda.is_available() else "cpu"

# 2. Prompt 词库构建
# [A] 东方文化
cn_clip_prompts_oriental_original = {
    "建筑": ["宫殿建筑", "庭院园林", "牌坊建筑", "寺庙建筑", "塔楼宝塔", "飞檐斗拱", "瓦屋顶建筑", "石桥拱桥",
             "城门城墙", "四合院民居", "鼓楼建筑", "钟楼建筑", "水榭亭台", "花园庭院廊桥", "城池护城河", "石阶台阶",
             "拱形门洞", "木结构房屋", "窗棂花窗"],
    "服饰": ["汉服", "旗袍", "唐装", "京剧戏服", "官服袍服", "少数民族服饰", "婚礼礼服", "凤冠头饰", "腰带佩饰",
             "绣花鞋", "头巾发饰", "刺绣服饰", "儒衫长袍", "舞龙服", "舞狮服", "披风斗篷", "马面裙"],
    "饮食": ["茶具", "茶席布置", "传统菜肴", "糕点甜点", "包子馒头", "饺子", "火锅", "酒坛酒壶", "月饼", "糖葫芦",
             "粽子", "熏腊肉", "烧烤摊位", "碗筷餐具", "竹蒸笼", "传统糖果", "米糕", "豆腐", "煲汤砂锅"],
    "艺术": ["水墨画", "书法作品", "京剧脸谱", "古琴", "笛子", "雕刻工艺", "木雕", "石雕", "青花瓷器", "剪纸艺术",
             "皮影戏", "刺绣工艺", "陶瓷器皿", "漆器", "舞蹈表演服饰", "民乐演奏场景", "花瓶纹饰", "戏台表演"],
    "节日与习俗": ["舞龙舞狮", "赏月", "灯笼装饰", "庙会活动", "祈福仪式", "婚礼习俗", "扫墓祭祖", "赛龙舟", "煮腊八粥",
                   "鞭炮燃放", "对联春联", "灶王仪式", "泼水节", "花灯展", "节日市集", "纸鸢风筝", "祭坛祭品",
                   "香炉燃香"],
    "环境文化": ["古镇街道", "传统村落", "农田稻田", "石桥", "古街铺面", "古城遗址", "庭院水池", "驿站", "竹林",
                  "花窗木窗", "山水景观", "茶园", "亭台楼阁山庄", "荷塘", "假山池塘", "岩洞石壁", "梅园花园", "松林"]
}

cn_clip_prompts_oriental_scene = {
    "建筑": ["飞檐斗拱的屋顶特写", "青砖灰瓦的古民居庭院", "夜间灯光照亮的古城墙", "石桥横跨河面", "城门前的石狮子守护",
             "庭院内的假山与池塘", "园林中曲折的廊桥", "雪景下的古塔", "暮色中的庙宇剪影", "河畔的亭台楼阁",
             "山间的寺庙全景", "春日花园中的牌坊", "祭典中装饰彩灯的鼓楼", "窗户外悬挂的红灯笼", "雾气笼罩的古镇街道"],
    "服饰": ["身穿汉服的女子在花园中", "穿旗袍在街头漫步", "舞台上表演京剧的演员", "婚礼上佩戴凤冠与红嫁衣的新娘",
             "民族舞蹈中的彩色服饰", "少数民族节日游行", "演员腰间佩戴绣花腰带", "脚穿绣花鞋的舞者",
             "儒衫长袍的学士在书院", "舞龙队员穿着节日彩服", "舞狮表演中装束鲜艳的队员", "冬日披风站在古城街头",
             "唐装男子在茶馆品茶", "刺绣服饰在集市上展示"],
    "饮食": ["木桌上的火锅宴席", "茶壶茶杯配茶盘", "竹蒸笼中热气腾腾的包子", "街头糖葫芦摊位", "月饼整齐摆在盘中",
             "端午节的粽子礼盒", "篝火旁的烧烤架", "酒坛成排码放在酒窖", "厨房案板上的糕点制作过程", "米糕切片摆盘",
             "豆腐摊位上的豆腐块", "砂锅冒着热气的汤", "茶席上放着茶叶罐与茶勺", "宴席上的多道菜肴与筷子"],
    "艺术": ["书桌上的宣纸书法", "展厅里的青花瓷瓶", "墙上悬挂的水墨画", "演员脸上精致的京剧脸谱", "木雕佛像的细节",
             "石雕龙柱的柱头", "舞台上的民乐演奏", "演员手持笛子在表演", "剪纸作品贴在窗户上", "皮影戏的幕布与灯光",
             "漆器盒子的纹饰", "刺绣绢布上的花鸟图案", "陶瓷碗上的龙凤图案", "民族舞舞台上的服饰展示"],
    "节日与习俗": ["街头舞龙表演", "舞狮队在鼓声中表演", "元宵节夜晚挂满红灯笼", "庙会上人群拥挤的景象",
                    "游客在香炉前祈福", "婚礼上敬茶仪式", "墓地前焚香祭祖", "河道上的赛龙舟队伍", "家庭厨房煮腊八粥",
                    "除夕夜燃放鞭炮的街头", "门口张贴春联的院落", "灶台上的祭品陈列", "泼水节现场的人群",
                    "灯会展出的彩灯", "节日市集的摊位", "春天放飞风筝的草地", "祭坛摆放的瓜果供品"],
    "环境文化": ["阳光照耀的古镇石板路", "雪景中的古城门", "农田里劳作的农民", "桥下的流水与倒影", "老街上的铺面招牌",
                  "残破的古城遗迹", "池塘边的廊桥与荷花", "驿站门前的马匹", "茶园中采茶的妇女", "竹林间的小径",
                  "花窗透出的室内光", "山水之间的亭台楼阁", "荷塘中盛开的荷花", "假山喷泉", "岩洞中的石雕",
                  "梅花盛开的园林", "松林中的小庙", "黄昏下的村落远景"]
}

# [B] 西方文化
cn_clip_prompts_western = [
    "哥特式教堂建筑", "尖顶教堂", "欧式城堡", "古罗马柱廊", "巴洛克风格建筑",
    "喷泉广场", "欧式庄园", "西式别墅", "红砖壁炉", "彩色玻璃窗",
    "大理石雕像", "西式庭院草坪", "凯旋门风格建筑", "白色婚礼凉亭",
    "西式牛排大餐", "汉堡与薯条", "红酒高脚杯", "刀叉餐具", "下午茶三层塔",
    "咖啡拉花", "面包烘焙", "香槟塔", "西式长桌晚宴", "烛光晚餐",
    "西装革履", "燕尾服", "白色婚纱", "晚礼服", "牛仔服饰",
    "西方宫廷服饰", "骑士装束", "金发碧眼的人物特征",
    "油画作品", "交响乐团演奏", "钢琴演奏", "芭蕾舞表演", "圣诞树装饰",
    "万圣节南瓜", "复活节彩蛋", "教堂唱诗班", "狂欢节游行"
]

# [C] 现代豪华/商务
cn_clip_prompts_modern = [
    "现代化摩天大楼", "五星级酒店大堂", "无边泳池", "豪华健身房", "高端商务会议室",
    "明亮的落地窗", "极简主义设计", "智能家居设备", "电梯间", "旋转门",
    "现代简约卧室", "高级卫浴设施", "浴缸泡澡", "城市夜景天际线",
    "笔记本电脑办公", "平板电脑", "智能手机", "高清液晶电视",
    "真皮沙发", "大理石地面", "水晶吊灯", "高级地毯",
    "高清晰度摄影", "4K画质", "明亮采光", "现代科技感",
    "商务精英", "整洁干净的房间", "奢华生活方式"
]


# 3. 函数定义

def get_oriental_list(use_scene):
    prompts = []
    for cat in cn_clip_prompts_oriental_original.keys():
        if use_scene:
            prompts.extend(cn_clip_prompts_oriental_original[cat] + cn_clip_prompts_oriental_scene[cat])
        else:
            prompts.extend(cn_clip_prompts_oriental_original[cat])
    return prompts


def encode_text_prompts(prompt_list, model, device):
    """编码文本特征"""
    tokens = tokenize(prompt_list).to(device)
    with torch.no_grad():
        features = model.encode_text(tokens)
        features /= features.norm(dim=-1, keepdim=True)
    return features


def calculate_score(image_feats, text_feats, mode="topk", k=50):
    """计算图像与文本相似度得分"""
    similarity = (image_feats @ text_feats.T).squeeze(0).cpu().numpy()
    if mode == "max":
        return float(max(similarity))
    elif mode == "topk":
        actual_k = min(k, len(similarity))
        return float(sum(sorted(similarity, reverse=True)[:actual_k]) / actual_k)
    return 0.0


def softmax_polarity(score_e, score_w, temperature=0.01):
    """
    计算东方文化极性概率。
    Temperature 越小，分数差异放大程度越高。
    """
    try:
        exp_e = np.exp(score_e / temperature)
        exp_w = np.exp(score_w / temperature)
        return exp_e / (exp_e + exp_w)
    except OverflowError:
        return 1.0 if score_e > score_w else 0.0


# 4. 主程序流程

print("正在加载模型...")
model, preprocess = load_from_name("ViT-B-16", device=device)
model.eval()

# 编码所有文本特征
print("正在编码文本特征...")
list_oriental = get_oriental_list(use_scene_prompts)
feats_oriental = encode_text_prompts(list_oriental, model, device)
feats_western = encode_text_prompts(cn_clip_prompts_western, model, device)
feats_modern = encode_text_prompts(cn_clip_prompts_modern, model, device)
print(f"特征编码完成")

# 处理图片
frame_results = []
print(f"开始处理目录: {scene_dir}")

for note_id in os.listdir(scene_dir):
    note_folder = os.path.join(scene_dir, note_id)
    if not os.path.isdir(note_folder):
        continue

    for img_file in os.listdir(note_folder):
        if img_file.lower().endswith((".jpg", ".png", ".jpeg", ".webp")):
            img_path = os.path.join(note_folder, img_file)
            try:
                image = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
                with torch.no_grad():
                    image_features = model.encode_image(image)
                    image_features /= image_features.norm(dim=-1, keepdim=True)

                # 计算相似度
                score_east = calculate_score(image_features, feats_oriental, mode=similarity_mode, k=top_k)
                score_west = calculate_score(image_features, feats_western, mode=similarity_mode, k=top_k)
                score_modern = calculate_score(image_features, feats_modern, mode=similarity_mode, k=top_k)

                # 计算极性概率
                prob_east = softmax_polarity(score_east, score_west, temperature=0.05)

                frame_results.append({
                    "笔记id": note_id,
                    "Score_East_Raw": score_east,
                    "Score_West_Raw": score_west,
                    "Score_Modern_Raw": score_modern,
                    "Prob_East_Raw": prob_east
                })

                print(f"[{note_id}] {img_file[:10]}... | 东:{score_east:.3f} | 西:{score_west:.3f} | 概率:{prob_east:.3f}")

            except Exception as e:
                print(f"Error processing {img_path}: {e}")

# 5. 数据聚合与全量归一化
print("-" * 30)
print("正在进行聚合与归一化处理...")

df_frame = pd.DataFrame(frame_results)

# 按笔记ID聚合，取均值
df_video = df_frame.groupby("笔记id").agg({
    "Score_East_Raw": "mean",
    "Score_West_Raw": "mean",
    "Score_Modern_Raw": "mean",
    "Prob_East_Raw": "mean"
}).reset_index()

df_video.rename(columns={"Prob_East_Raw": "M_Culture_Polarity"}, inplace=True)

def min_max_normalize(series):
    return (series - series.min()) / (series.max() - series.min())

# Min-Max 归一化
df_video["Score_East_Norm"] = min_max_normalize(df_video["Score_East_Raw"])
df_video["Score_West_Norm"] = min_max_normalize(df_video["Score_West_Raw"])
df_video["Control_Modern_Norm"] = min_max_normalize(df_video["Score_Modern_Raw"])

# 原始差值
df_video["Raw_Diff"] = df_video["Score_East_Raw"] - df_video["Score_West_Raw"]

# 6. 保存结果
cols = [
    "笔记id",
    "M_Culture_Polarity",
    "Control_Modern_Norm",
    "Raw_Diff",
    "Score_East_Raw", "Score_East_Norm",
    "Score_West_Raw", "Score_West_Norm",
    "Score_Modern_Raw"
]
df_video = df_video[cols]
df_video.to_csv(output_csv, index=False, encoding="utf-8-sig")

print(f"处理完成！聚合后的数据已保存至: {output_csv}")