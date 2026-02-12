import os
import base64
import io
import logging
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from diffusers import StableDiffusionPipeline, EulerAncestralDiscreteScheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sd-api")

app = FastAPI(title="Local Stable Diffusion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = os.getenv("SD_MODEL", "runwayml/stable-diffusion-v1-5")

# Global pipeline (loaded once)
pipe: Optional[StableDiffusionPipeline] = None
device: str = "cpu"

class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: str = "blurry, low quality, distorted"
    num_inference_steps: int = 25
    guidance_scale: float = 7.5
    width: int = 512
    height: int = 512
    seed: Optional[int] = None

def pil_to_data_url_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

@app.on_event("startup")
def load_model():
    global pipe, device

    if torch.cuda.is_available():
        device = "cuda"
        dtype = torch.float16
    else:
        device = "cpu"
        dtype = torch.float32

    logger.info(f"Loading model: {MODEL_ID}")
    logger.info(f"Device: {device}, dtype: {dtype}")

    try:
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=dtype,
            safety_checker=None,  # remove if you want built-in safety checker
            requires_safety_checker=False,
        )

        # Optional: nicer results for many prompts
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

        if device == "cuda":
            pipe = pipe.to("cuda")
            pipe.enable_attention_slicing()
            # pipe.enable_xformers_memory_efficient_attention()  # if you install xformers
        else:
            pipe = pipe.to("cpu")

        logger.info("✅ Model loaded")
    except Exception as e:
        logger.error(f"Failed to load model: {e}", exc_info=True)
        raise

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID, "device": device, "loaded": pipe is not None}

@app.post("/generate")
def generate(req: ImageRequest):
    global pipe
    if pipe is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if req.width % 8 != 0 or req.height % 8 != 0:
        raise HTTPException(status_code=400, detail="width/height must be divisible by 8 (e.g., 512, 768)")

    try:
        generator = None
        if req.seed is not None:
            generator = torch.Generator(device=device).manual_seed(req.seed)

        logger.info(f"Prompt: {req.prompt}")
        with torch.inference_mode():
            result = pipe(
                prompt=req.prompt,
                negative_prompt=req.negative_prompt,
                num_inference_steps=req.num_inference_steps,
                guidance_scale=req.guidance_scale,
                width=req.width,
                height=req.height,
                generator=generator,
            )

        img = result.images[0]
        return {
            "image": pil_to_data_url_png(img),
            "prompt": req.prompt,
            "seed": req.seed,
            "device": device,
            "model": MODEL_ID,
        }
    except torch.cuda.OutOfMemoryError:
        raise HTTPException(status_code=507, detail="CUDA OOM. Try smaller width/height (512) or fewer steps.")
    except Exception as e:
        logger.error(f"Generate error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
