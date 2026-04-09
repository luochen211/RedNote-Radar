# Analysis Metrics Archive

Canonical archive migrated from the legacy local folder
`3.其他剩余的分析页数值特征代码`.

Contents:
- `notebooks/`: remaining metric notebooks for audio sentiment, human voice presence, text sentiment, and consistency
- `audio_emotion/`: cleaned `Music2Emotion-main` source snapshot without checkpoints or heavyweight inference models
- `deep_sentibank/`: cleaned DeepSentiBank reference code without bundled runtime binaries and pretrained weights
- `manifests/`: excluded-asset notes

Canonical local-only supplement paths:
- `audio_emotion/dataset/`
- `audio_emotion/inference/data/`
- `audio_emotion/saved_models/`
- `deep_sentibank/caffe_sentibank_train_iter_250000`
- `deep_sentibank/*.dll`
- `deep_sentibank/*.exe`
- `deep_sentibank/test/`
- `local-sample-data/`

These remain local and gitignored because they are runtime-heavy or
machine-specific.
