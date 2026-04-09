import os
from pathlib import Path


VIDEO_PATH = Path(__file__).resolve().parents[1] / "icon_data" / "raw-videos"
videolist = sorted(p.name for p in VIDEO_PATH.glob("*.mp4"))

videolist1 = videolist[:3000]
videolist2 = videolist[3000:6000]
videolist3 = videolist[6000:9000]
videolist4 = videolist[9000:12000]
videolist5 = videolist[12000:]

import json
with open('videolist1.json', 'w') as f:
    json.dump(videolist1, f)
with open('videolist2.json', 'w') as f:
    json.dump(videolist2, f)
with open('videolist3.json', 'w') as f:
    json.dump(videolist3, f)
with open('videolist4.json', 'w') as f:
    json.dump(videolist4, f)
with open('videolist5.json', 'w') as f:
    json.dump(videolist5, f)
