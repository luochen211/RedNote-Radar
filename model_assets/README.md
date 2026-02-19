# Model Assets Layout

The project resolves model assets from:

1. `MODEL_ASSETS_DIR` (if set)
2. `model_assets/` (recommended standard layout)
3. `网页代码/1.预测页代码与部分分析页代码/` (legacy fallback)

Recommended structure:

```text
model_assets/
  weight/
    bert/
    code/
      checkpoints/
        XIAOHONGSHU/
          BOTTLE/
            BOTTLE_best_all29_bs1.pth
            BOTTLE_best_icon0_bs1_new.pth
  benchmarks/
    global_likes.json
    local_likes.json
```

Benchmark fallback filenames are still supported:

- `zyj_exceltojason/xiaohongshu_.json`
- `zyj_exceltojason/xiaohongshu.json`
- `zyj_exceltojason/xhs.json`
- `szz_featureextraction/icon_data_all.json`
- `szz_featureextraction/icon_data_1.json`
- `zyj_exceltojason/icon_data_feature.json`
