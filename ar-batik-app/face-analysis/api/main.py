from __future__ import annotations

from collections import Counter
from typing import Dict, List, Tuple

import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import facer

app = FastAPI(title="Color Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cuda" if torch.cuda.is_available() else "cpu"

_face_detector = None
_face_parser = None


SEASON_INFO: Dict[str, Dict[str, object]] = {
    "Spring": {
        "emoji": "spring",
        "description": "Hangat & terang - cocok untuk nuansa keemasan.",
        "colors": ["Warm Peach", "Coral", "Golden Red"],
        "palette": ["#FDB7A9", "#F7624D", "#BA2121"],
    },
    "Summer": {
        "emoji": "summer",
        "description": "Sejuk & terang - cocok untuk pastel lembut.",
        "colors": ["Soft Pink", "Mauve", "Berry"],
        "palette": ["#F3B8CA", "#D3769B", "#93466B"],
    },
    "Autumn": {
        "emoji": "autumn",
        "description": "Hangat & dalam - cocok untuk warna earthy.",
        "colors": ["Terracotta", "Brick", "Deep Wine"],
        "palette": ["#D27C6E", "#9B463C", "#61101C"],
    },
    "Winter": {
        "emoji": "winter",
        "description": "Sejuk & dalam - cocok untuk kontras berani.",
        "colors": ["Icy Pink", "True Red", "Deep Burgundy"],
        "palette": ["#EDDFE3", "#B12F39", "#620E25"],
    },
}


# --- Model helpers ---

def _get_farl_models():
    global _face_detector, _face_parser
    if _face_detector is None:
        _face_detector = facer.face_detector("retinaface/mobilenet", device=device)
        _face_parser = facer.face_parser("farl/lapa/448", device=device)
    return _face_detector, _face_parser


def _resize_if_needed(rgb: np.ndarray, max_size: int = 640) -> np.ndarray:
    h, w = rgb.shape[:2]
    scale = max(h, w) / max_size if max(h, w) > max_size else 1.0
    if scale <= 1.0:
        return rgb
    new_w = int(w / scale)
    new_h = int(h / scale)
    return cv2.resize(rgb, (new_w, new_h), interpolation=cv2.INTER_AREA)


def _decode_image(upload: UploadFile) -> np.ndarray:
    content = upload.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty image payload.")
    arr = np.frombuffer(content, np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image.")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return _resize_if_needed(rgb)


def _parse_face(rgb: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    fd, fp = _get_farl_models()
    image = facer.hwc2bchw(rgb).to(device)
    with torch.inference_mode():
        faces = fd(image)
    if not faces or "rects" not in faces or len(faces["rects"]) == 0:
        raise HTTPException(status_code=422, detail="No face detected.")
    with torch.inference_mode():
        faces = fp(image, faces)
    seg_logits = faces["seg"]["logits"]
    seg_probs = seg_logits.softmax(dim=1).cpu()
    tensor = seg_probs.permute(0, 2, 3, 1)[0].numpy()
    return rgb, tensor


def _get_rgb_codes(rgb: np.ndarray) -> np.ndarray:
    img, tensor = _parse_face(rgb)
    llip = tensor[:, :, 7]
    ulip = tensor[:, :, 9]
    lips = llip + ulip
    binary_mask = (lips >= 0.5).astype(int)
    indices = np.argwhere(binary_mask)
    if len(indices) == 0:
        raise HTTPException(status_code=422, detail="No lip pixels detected.")
    return img[indices[:, 0], indices[:, 1], :]


def _filter_lip_random(rgb_codes: np.ndarray, random_num: int = 60) -> np.ndarray:
    blue_condition = rgb_codes[:, 2] <= 227
    red_condition = rgb_codes[:, 0] >= 97
    filtered = rgb_codes[blue_condition & red_condition]
    if len(filtered) == 0:
        filtered = rgb_codes
    rng = np.random.default_rng(42)
    n = min(random_num, len(filtered))
    idx = rng.integers(0, len(filtered), n)
    return filtered[idx]


def _calc_dis(rgb_codes: np.ndarray) -> List[str]:
    spring = np.array([[253, 183, 169], [247, 98, 77], [186, 33, 33]])
    summer = np.array([[243, 184, 202], [211, 118, 155], [147, 70, 105]])
    autumn = np.array([[210, 124, 110], [155, 70, 60], [97, 16, 28]])
    winter = np.array([[237, 223, 227], [177, 47, 57], [98, 14, 37]])
    palettes = {
        "Spring": spring,
        "Summer": summer,
        "Autumn": autumn,
        "Winter": winter,
    }
    results = []
    for px in rgb_codes:
        best = min(
            palettes,
            key=lambda s: min(np.linalg.norm(px - ref) for ref in palettes[s]),
        )
        results.append(best)
    return results


def _mean_rgb(rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    valid = rgb[mask > 0]
    if len(valid) == 0:
        return np.zeros(3)
    return valid.mean(axis=0)


def _rgb_to_hex(rgb: np.ndarray) -> str:
    r, g, b = [int(max(0, min(255, v))) for v in rgb]
    return f"#{r:02X}{g:02X}{b:02X}"


def _skin_mask(tensor: np.ndarray) -> np.ndarray:
    face_skin = tensor[:, :, 1]
    return (face_skin >= 0.5).astype(int)


def _lip_mask(tensor: np.ndarray) -> np.ndarray:
    llip = tensor[:, :, 7]
    ulip = tensor[:, :, 9]
    lips = llip + ulip
    return (lips >= 0.5).astype(int)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "device": device}


@app.post("/analyze")
def analyze(image: UploadFile = File(...)):
    if image.content_type not in {"image/jpeg", "image/jpg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    rgb = _decode_image(image)
    img, tensor = _parse_face(rgb)

    skin_mask = _skin_mask(tensor)
    lip_mask = _lip_mask(tensor)

    skin_mean = _mean_rgb(img, skin_mask)
    lip_mean = _mean_rgb(img, lip_mask)

    rgb_codes = _get_rgb_codes(img)
    filtered = _filter_lip_random(rgb_codes, random_num=60)
    season_results = _calc_dis(filtered)

    counter = Counter(season_results)
    dominant_season, dominant_count = counter.most_common(1)[0]
    total = len(season_results)
    confidence = dominant_count / total if total else 0.0

    info = SEASON_INFO[dominant_season]

    return {
        "season": dominant_season,
        "emoji": info["emoji"],
        "description": info["description"],
        "confidence": round(confidence, 3),
        "counts": dict(counter),
        "palette": info["palette"],
        "colors": info["colors"],
        "mean_rgb": {
            "skin": [round(v, 1) for v in skin_mean.tolist()],
            "lip": [round(v, 1) for v in lip_mean.tolist()],
        },
        "hex": {
            "skin": _rgb_to_hex(skin_mean),
            "lip": _rgb_to_hex(lip_mean),
        },
        "image_size": {"width": int(img.shape[1]), "height": int(img.shape[0])},
    }
