# Local Supplemental Assets

The canonical package for the prediction pipeline now lives under
`research/prediction-pipeline/`.

Large or workstation-specific assets were migrated out of the legacy
`1.预测页代码与部分分析页代码` folder into canonical local-only paths here:

- `feature_extraction/icon_data/raw-images/`: raw cover image bundle
- `feature_extraction/icon_data/raw-videos/`: raw video bundle
- `prediction_model/bert/pytorch_model.bin`: local BERT weights
- `prediction_model/torchvggish/test.wav`: TorchVGGish sample asset
- `prediction_model/local-assets/audio-features/`: extracted audio feature tensors
- `prediction_model/local-assets/video-frame-features/`: extracted video-frame feature tensors
- `text_image_features/local-assets/sample-images/`: extra sample images
- `text_image_features/local-assets/windows-wheels/`: archived Windows wheel files

These paths are intentionally gitignored because they are large local
supplements rather than source-controlled code.
