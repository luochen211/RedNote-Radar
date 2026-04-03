# Excluded Local Assets

## DeepSentiBank

Excluded because they are large runtime or model artifacts:
- `caffe_sentibank_train_iter_250000`
- `*.dll`
- `extract_nfeatures.exe`
- nested `.git/`
- `test/` generated outputs

## Music2Emotion

Excluded because they are pretrained or runtime-heavy artifacts:
- `saved_models/*.ckpt`
- `inference/data/*.pt`
- local dataset bundle under `dataset/`

## Notebook Workspace

Excluded:
- `.ipynb_checkpoints/`
- local mixed media under the original `data/` directory
