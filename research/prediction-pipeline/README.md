# Prediction Pipeline Archive

Cleaned export of the materials from `1.预测页代码与部分分析页代码`.

Contents:
- `feature_extraction/`: video frame, audio, face, and aesthetic feature extraction scripts
- `prediction_model/`: prediction-side code, tokenizer config, and lightweight metadata
- `text_image_features/`: text, title-tag, cover-quality, and cover-aesthetics feature scripts
- `manifests/`: notes about excluded local-only assets

Local-only assets intentionally excluded from Git:
- `weight/bert/pytorch_model.bin`
- `zyj_exceltojason/*.whl`
- extracted `.pkl` feature tensors
- local IDE folders and `venv/`
- large raw media folders under `icon_data/`

The original pipeline notes were converted from the local `readme.txt` and preserved in `manifests/original-notes.md`.
