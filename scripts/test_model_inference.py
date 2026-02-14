#!/usr/bin/env python3
import json
import subprocess
import sys


def main() -> int:
    payload = {
        "title": "测试",
        "textContent": "酒店体验不错",
        "tags": ["酒店", "旅行"],
        "followers": 100,
        "subscribers": 50,
        "likes": 30,
    }

    proc = subprocess.run(
        ["python3", "scripts/bottle_infer.py"],
        input=json.dumps(payload).encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr.decode("utf-8", errors="ignore"))
        return 1

    result = json.loads(proc.stdout.decode("utf-8"))
    assert "engagementScore" in result
    assert 0 <= int(result["engagementScore"]["local"]) <= 100
    assert 0 <= int(result["engagementScore"]["global"]) <= 100

    dims = result.get("testDimensions", {}).get("input", {})
    assert int(dims.get("textTokens", 0)) == 128
    assert int(dims.get("videoFeatureDim", 0)) == 4096
    assert int(dims.get("audioFeatureDim", 0)) == 12288

    print("model inference smoke test passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
