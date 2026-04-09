# Prediction Pipeline Archive

Canonical archive migrated from the legacy local folder
`1.预测页代码与部分分析页代码`.

Contents:
- `feature_extraction/`: video frame, audio, face, and aesthetic feature extraction scripts
- `prediction_model/`: prediction-side code, tokenizer config, and lightweight metadata
- `text_image_features/`: text, title-tag, cover-quality, and cover-aesthetics feature scripts
- `manifests/`: notes about excluded local-only assets

Canonical local-only supplement paths:
- `feature_extraction/icon_data/raw-images/`
- `feature_extraction/icon_data/raw-videos/`
- `prediction_model/bert/pytorch_model.bin`
- `prediction_model/torchvggish/test.wav`
- `prediction_model/local-assets/`
- `text_image_features/local-assets/`

These remain local and gitignored because they are large or
machine-specific.

The original pipeline notes were converted from the local `readme.txt`
and preserved in `manifests/original-notes.md`. The raw source note is
also preserved locally as `manifests/source-readme.txt`.
