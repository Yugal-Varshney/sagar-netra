import os
import sys
import tempfile
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

# main.py:
# SIH/backend/app/main.py
#
# parents[0] = app
# parents[1] = backend
# parents[2] = SIH

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# FASTAPI IMPORTS
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse


# ============================================================
# PROJECT IMPORTS
# ============================================================

from app.data.areas import AREAS

from app.services.sentinel_hub import (
    get_access_token,
    get_sentinel1_image,
    find_latest_sentinel1,
    get_latest_sentinel1_metadata,
)

from ml.inference.predict import predict_image


# ============================================================
# ML CHECKPOINT
# ============================================================

CHECKPOINT_PATH = (
    PROJECT_ROOT
    / "ml"
    / "checkpoints"
    / "oil_spill_model.pth"
)


# ============================================================
# FIXED CASE-001 DEMO IMAGE
# ============================================================
#
# Current project structure:
#
# SIH/
# ├── frontend/
# │   └── public/
# │       └── demo/
# │           └── case-001-sentinel.jpg
# │
# ├── backend/
# │   └── app/
# │       └── main.py
# │
# └── ml/
#
# This image is used ONLY for the Quick Spill Demo.
#
# ============================================================

DEMO_IMAGE_PATH = (
    PROJECT_ROOT
    / "frontend"
    / "public"
    / "demo"
    / "case-001-sentinel.jpg"
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Sagar Netra API",
    description=(
        "Backend API for satellite-based "
        "marine oil-spill monitoring."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "status": "online",
        "service": "Sagar Netra API",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
async def health():

    return {
        "status": "healthy",
        "service": "Sagar Netra API",
    }


# ============================================================
# CONFIG TEST
# ============================================================

@app.get("/api/config-test")
async def config_test():

    return {
        "sentinel_client_id_configured": bool(
            os.getenv("SENTINEL_CLIENT_ID")
        ),

        "sentinel_client_secret_configured": bool(
            os.getenv("SENTINEL_CLIENT_SECRET")
        ),

        "ml_checkpoint_exists": (
            CHECKPOINT_PATH.is_file()
        ),

        "ml_checkpoint_path": str(
            CHECKPOINT_PATH
        ),

        "demo_image_exists": (
            DEMO_IMAGE_PATH.is_file()
        ),

        "demo_image_path": str(
            DEMO_IMAGE_PATH
        ),
    }


# ============================================================
# SENTINEL AUTH TEST
# ============================================================

@app.get("/api/sentinel/auth-test")
async def sentinel_auth_test():

    try:

        token = await get_access_token()

        return {
            "status": "success",
            "authenticated": bool(token),
            "message": (
                "Sentinel Hub authentication successful."
            ),
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# AREAS
# ============================================================

@app.get("/api/areas")
async def get_areas():

    return {
        "status": "success",
        "areas": list(AREAS.values()),
    }


# ============================================================
# AREA HELPER
# ============================================================

def get_area_or_404(area_id: str):

    area = AREAS.get(area_id)

    if not area:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Unknown monitoring area: {area_id}"
            ),
        )

    return area


# ============================================================
# LIVE SENTINEL-1 IMAGE
# ============================================================
#
# LIVE ONLY.
#
# Selected AOI
#      ↓
# Sentinel Hub
#      ↓
# Latest available Sentinel-1 observation
#      ↓
# Image returned to frontend
#
# The CASE-001 demo image is NEVER used here.
#
# ============================================================

@app.get("/api/satellite/image/{area_id}")
async def satellite_image(area_id: str):

    area = get_area_or_404(area_id)

    try:

        print(
            "[LIVE] Requesting latest available "
            f"Sentinel-1 image for {area_id}"
        )

        image_bytes = await get_sentinel1_image(
            area["bbox"]
        )

        print(
            "[LIVE] Sentinel-1 image received."
        )

        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=300",
            },
        )

    except Exception as error:

        print(
            "[LIVE Satellite Image Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# SENTINEL-1 AVAILABILITY
# ============================================================

@app.get(
    "/api/satellite/availability/{area_id}"
)
async def satellite_availability(
    area_id: str,
):

    area = get_area_or_404(area_id)

    try:

        observation = await find_latest_sentinel1(
            area["bbox"]
        )

        if observation is None:

            return {
                "status": "success",
                "available": False,
                "area": area,
                "observation": None,
            }

        properties = observation.get(
            "properties",
            {},
        )

        return {
            "status": "success",
            "available": True,
            "area": area,
            "observation": {

                "id": observation.get(
                    "id"
                ),

                "datetime": properties.get(
                    "datetime"
                ),

                "platform": properties.get(
                    "platform"
                ),

                "constellation": properties.get(
                    "constellation"
                ),

                "instrument_mode": properties.get(
                    "sar:instrument_mode"
                ),

                "polarization": properties.get(
                    "s1:polarization"
                ),

                "orbit_state": properties.get(
                    "sat:orbit_state"
                ),
            },
        }

    except Exception as error:

        print(
            "[Satellite Availability Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# LATEST SENTINEL-1 METADATA
# ============================================================

@app.get(
    "/api/satellite/metadata/{area_id}"
)
async def satellite_metadata(
    area_id: str,
):

    area = get_area_or_404(area_id)

    try:

        metadata = (
            await get_latest_sentinel1_metadata(
                area["bbox"]
            )
        )

        if metadata is None:

            return {
                "status": "success",
                "available": False,
                "metadata": None,
            }

        return {
            "status": "success",
            "available": True,
            "metadata": metadata,
        }

    except Exception as error:

        print(
            "[Satellite Metadata Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# LIVE SENTINEL-1 + AI DETECTION
# ============================================================
#
# REAL LIVE PIPELINE:
#
# Selected AOI
#      ↓
# Sentinel Hub
#      ↓
# Latest available Sentinel-1
#      ↓
# ResNet18
#      ↓
# OIL / NO_OIL
#
# ============================================================

@app.get(
    "/api/satellite/detect/{area_id}"
)
async def satellite_detect(
    area_id: str,
):

    area = get_area_or_404(area_id)

    temporary_image_path = None

    try:

        # ----------------------------------------------------
        # STEP 1 — GET LIVE SENTINEL-1 IMAGE
        # ----------------------------------------------------

        print(
            "[LIVE] Requesting Sentinel-1 "
            f"image for {area_id}"
        )

        image_bytes = await get_sentinel1_image(
            area["bbox"]
        )

        print(
            "[LIVE] Sentinel-1 image received."
        )

        # ----------------------------------------------------
        # STEP 2 — VERIFY MODEL CHECKPOINT
        # ----------------------------------------------------

        if not CHECKPOINT_PATH.is_file():

            raise FileNotFoundError(
                "Oil-spill model checkpoint not found: "
                f"{CHECKPOINT_PATH}"
            )

        print(
            "[LIVE AI] Checkpoint found:",
            CHECKPOINT_PATH,
        )

        # ----------------------------------------------------
        # STEP 3 — SAVE LIVE IMAGE TEMPORARILY
        # ----------------------------------------------------

        with tempfile.NamedTemporaryFile(
            suffix=".png",
            delete=False,
        ) as temporary_file:

            temporary_file.write(
                image_bytes
            )

            temporary_image_path = (
                temporary_file.name
            )

        print(
            "[LIVE AI] Temporary image:",
            temporary_image_path,
        )

        # ----------------------------------------------------
        # STEP 4 — RUN RESNET18
        # ----------------------------------------------------

        print(
            "[LIVE AI] Running oil-spill model..."
        )

        prediction = predict_image(
            image_path=temporary_image_path,
            checkpoint_path=str(
                CHECKPOINT_PATH
            ),
        )

        print(
            "[LIVE AI] Prediction:",
            prediction,
        )

        # ----------------------------------------------------
        # STEP 5 — RETURN LIVE RESULT
        # ----------------------------------------------------

        return {

            "status": "success",

            "area": {
                "id": area["id"],
                "name": area["name"],
                "region": area["region"],
                "risk_level": area["risk_level"],
            },

            "detection": prediction,

            "source": {
                "satellite": "Sentinel-1",
                "sensor": "SAR",
                "band": "VV",
            },

            "demo": False,
        }

    except Exception as error:

        print(
            "[LIVE Satellite Detection Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    finally:

        # ----------------------------------------------------
        # CLEAN TEMPORARY LIVE IMAGE
        # ----------------------------------------------------

        if (
            temporary_image_path
            and os.path.exists(
                temporary_image_path
            )
        ):

            try:

                os.remove(
                    temporary_image_path
                )

                print(
                    "[LIVE AI] Temporary image removed."
                )

            except Exception as cleanup_error:

                print(
                    "[LIVE AI] Temporary image "
                    "cleanup failed:",
                    cleanup_error,
                )


# ============================================================
# DEMO / CASE-001 FIXED IMAGE
# ============================================================
#
# This endpoint serves:
#
#     SIH/frontend/public/demo/case-001-sentinel.jpg
#
# No Sentinel Hub request is made.
#
# ============================================================

@app.get(
    "/api/demo/spill/image"
)
async def demo_spill_image():

    print(
        "[DEMO] Requesting fixed CASE-001 image."
    )

    if not DEMO_IMAGE_PATH.is_file():

        raise HTTPException(
            status_code=404,
            detail=(
                "CASE-001 demo image not found at: "
                f"{DEMO_IMAGE_PATH}"
            ),
        )

    print(
        "[DEMO] Serving fixed CASE-001 image:",
        DEMO_IMAGE_PATH,
    )

    return FileResponse(
        path=str(DEMO_IMAGE_PATH),
        media_type="image/jpeg",
        headers={
            "Cache-Control": "no-store",
        },
    )


# ============================================================
# DEMO / CASE-001 DETECTION
# ============================================================
#
# CASE-001 is a fixed historical demonstration scenario.
#
# The image is real and fixed:
#
#     SIH/frontend/public/demo/case-001-sentinel.jpg
#
# We still run ResNet18 on that image and log the actual
# runtime model prediction.
#
# However, the displayed CASE-001 result is the fixed
# historical case result so the SIH demonstration is
# deterministic.
#
# This endpoint is explicitly marked DEMO = True.
#
# LIVE detection remains completely independent and uses
# genuine runtime ResNet18 inference.
#
# ============================================================

@app.get(
    "/api/demo/spill/detect/{area_id}"
)
async def demo_spill_detect(
    area_id: str,
):

    area = get_area_or_404(area_id)

    try:

        # ----------------------------------------------------
        # STEP 1 — VERIFY FIXED DEMO IMAGE
        # ----------------------------------------------------

        if not DEMO_IMAGE_PATH.is_file():

            raise FileNotFoundError(
                "CASE-001 demo image not found at: "
                f"{DEMO_IMAGE_PATH}"
            )

        print(
            "[DEMO] CASE-001 image found:",
            DEMO_IMAGE_PATH,
        )

        # ----------------------------------------------------
        # STEP 2 — VERIFY MODEL CHECKPOINT
        # ----------------------------------------------------

        if not CHECKPOINT_PATH.is_file():

            raise FileNotFoundError(
                "Oil-spill model checkpoint not found: "
                f"{CHECKPOINT_PATH}"
            )

        print(
            "[DEMO] Model checkpoint found:",
            CHECKPOINT_PATH,
        )

        # ----------------------------------------------------
        # STEP 3 — RUN RESNET18 ON THE FIXED IMAGE
        # ----------------------------------------------------
        #
        # This is retained so we can see what the trained
        # model actually predicts for the demonstration image.
        #
        # The result is logged as runtime_model_prediction.
        #
        # ----------------------------------------------------

        print(
            "[DEMO] Running ResNet18 on fixed "
            "CASE-001 image..."
        )

        model_prediction = predict_image(
            image_path=str(
                DEMO_IMAGE_PATH
            ),
            checkpoint_path=str(
                CHECKPOINT_PATH
            ),
        )

        print(
            "[DEMO] Runtime ResNet18 prediction:",
            model_prediction,
        )

        # ----------------------------------------------------
        # STEP 4 — FIXED HISTORICAL CASE RESULT
        # ----------------------------------------------------
        #
        # CASE-001:
        # Gulf of Kutch historical spill
        #
        # Historical case confidence:
        # 94%
        #
        # This result is explicitly DEMO / TEST data.
        #
        # ----------------------------------------------------

        demo_prediction = {

            "label": "OIL",

            "confidence": 0.94,

            "probabilities": {
                "NO_OIL": 0.06,
                "OIL": 0.94,
            },

            "model": "ResNet18 — CASE-001 Demo",

            "device": "CPU",

            "checkpoint": str(
                CHECKPOINT_PATH
            ),
        }

        print(
            "[DEMO] Fixed CASE-001 result:",
            demo_prediction,
        )

        # ----------------------------------------------------
        # STEP 5 — RETURN DEMO RESULT
        # ----------------------------------------------------

        return {

            "status": "success",

            "area": {
                "id": area["id"],
                "name": area["name"],
                "region": area["region"],
                "risk_level": area["risk_level"],
            },

            "detection": demo_prediction,

            "source": {
                "satellite": "Sentinel-1 Test Image",
                "sensor": "SAR",
                "band": "VV",
            },

            "demo": True,

            "demo_case": {
                "id": "CASE-001",
                "title": "Gulf of Kutch Spill",
                "date": "12 June 2024",
                "status": "DEMO / TEST SCENARIO",
                "spill_area_km2": 12.8,
                "historical_confidence": 94,
            },

            # Actual model output is retained for transparency.
            "runtime_model_prediction": model_prediction,
        }

    except Exception as error:

        print(
            "[DEMO Detection Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# ML PREDICTION
# ============================================================

@app.post(
    "/api/ml/predict"
)
async def ml_predict():

    raise HTTPException(
        status_code=501,
        detail=(
            "Direct ML prediction endpoint is not "
            "configured yet. Use "
            "/api/satellite/detect/{area_id}."
        ),
    )


# ============================================================
# SATELLITE TEST
# ============================================================

@app.get(
    "/api/satellite/test/{area_id}"
)
async def satellite_test(
    area_id: str,
):

    area = get_area_or_404(area_id)

    try:

        observation = await find_latest_sentinel1(
            area["bbox"]
        )

        if observation is None:

            return {
                "status": "success",
                "area": area,
                "available": False,
                "message": (
                    "No Sentinel-1 observation was "
                    "found in the search window."
                ),
            }

        properties = observation.get(
            "properties",
            {},
        )

        return {

            "status": "success",

            "area": area,

            "available": True,

            "observation": {

                "id": observation.get(
                    "id"
                ),

                "datetime": properties.get(
                    "datetime"
                ),

                "platform": properties.get(
                    "platform"
                ),

                "constellation": properties.get(
                    "constellation"
                ),

                "instrument_mode": properties.get(
                    "sar:instrument_mode"
                ),

                "polarization": properties.get(
                    "s1:polarization"
                ),
            },
        }

    except Exception as error:

        print(
            "[Satellite Test Error]",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():

    print("=" * 60)

    print(
        "Sagar Netra API"
    )

    print(
        "Backend started successfully"
    )

    print(
        "API: http://127.0.0.1:8000"
    )

    print(
        "Docs: http://127.0.0.1:8000/docs"
    )

    print(
        "ML checkpoint:",
        CHECKPOINT_PATH,
    )

    print(
        "ML checkpoint exists:",
        CHECKPOINT_PATH.is_file(),
    )

    print(
        "CASE-001 demo image:",
        DEMO_IMAGE_PATH,
    )

    print(
        "CASE-001 demo image exists:",
        DEMO_IMAGE_PATH.is_file(),
    )

    print("=" * 60)