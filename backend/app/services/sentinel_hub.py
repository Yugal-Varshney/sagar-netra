import os
from datetime import datetime, timedelta, timezone
from functools import lru_cache

import httpx
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

CLIENT_ID = os.getenv("SENTINEL_CLIENT_ID")
CLIENT_SECRET = os.getenv("SENTINEL_CLIENT_SECRET")


# ============================================================
# SENTINEL HUB URLs
# ============================================================

TOKEN_URL = (
    "https://services.sentinel-hub.com/"
    "auth/realms/main/protocol/openid-connect/token"
)

CATALOG_URL = (
    "https://services.sentinel-hub.com/"
    "api/v1/catalog/1.0.0/search"
)

PROCESS_URL = (
    "https://services.sentinel-hub.com/"
    "api/v1/process"
)


# ============================================================
# ACCESS TOKEN
# ============================================================

@lru_cache(maxsize=1)
def _cached_token():
    return None


async def get_access_token():
    """
    Authenticate with Sentinel Hub using OAuth2
    client credentials.
    """

    if not CLIENT_ID or not CLIENT_SECRET:
        raise RuntimeError(
            "Sentinel Hub credentials are missing. "
            "Check SENTINEL_CLIENT_ID and "
            "SENTINEL_CLIENT_SECRET in .env"
        )

    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            data=data,
            timeout=30,
        )

    if response.status_code != 200:
        raise RuntimeError(
            "Sentinel Hub authentication failed: "
            f"{response.status_code} - {response.text}"
        )

    token_data = response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        raise RuntimeError(
            "Sentinel Hub authentication succeeded "
            "but no access token was returned."
        )

    return access_token


# ============================================================
# CATALOG SEARCH HELPER
# ============================================================

async def _catalog_search(
    bbox,
    start_time,
    end_time,
    limit=20,
):
    token = await get_access_token()

    payload = {
        "bbox": bbox,
        "datetime": f"{start_time}/{end_time}",
        "collections": [
            "sentinel-1-grd"
        ],
        "limit": limit,
        "fields": {
            "include": [
                "id",
                "properties.datetime",
                "properties.platform",
                "properties.constellation",
                "properties:sar:instrument_mode",
                "properties:s1:polarization",
                "properties:sat:orbit_state",
            ],
            "exclude": [],
        },
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            CATALOG_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )

    if response.status_code != 200:
        raise RuntimeError(
            "Sentinel Hub catalog search failed: "
            f"{response.status_code} - {response.text}"
        )

    return response.json()


# ============================================================
# FIND LATEST SENTINEL-1
# ============================================================

async def find_latest_sentinel1(bbox):
    """
    Find the newest available Sentinel-1 observation
    for the requested bounding box within the last 30 days.
    """

    now = datetime.now(timezone.utc)

    start = now - timedelta(days=30)

    start_time = start.strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    end_time = now.strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    data = await _catalog_search(
        bbox,
        start_time,
        end_time,
    )

    features = data.get(
        "features",
        []
    )

    if not features:
        return None

    def get_datetime(feature):
        return (
            feature
            .get("properties", {})
            .get("datetime", "")
        )

    features.sort(
        key=get_datetime,
        reverse=True,
    )

    return features[0]


# ============================================================
# LATEST METADATA
# ============================================================

async def get_latest_sentinel1_metadata(
    bbox
):
    """
    Return metadata for the newest available
    Sentinel-1 observation.
    """

    observation = await find_latest_sentinel1(
        bbox
    )

    if observation is None:
        return None

    properties = observation.get(
        "properties",
        {}
    )

    return {
        "id": observation.get("id"),

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
    }


# ============================================================
# EVALSCRIPT
# ============================================================

SENTINEL1_VV_EVALSCRIPT = """
//VERSION=3

function setup() {

    return {

        input: [{
            bands: ["VV"],
            units: ["LINEAR_POWER"]
        }],

        output: {
            bands: 3,
            sampleType: "UINT8"
        }

    };

}

function evaluatePixel(sample) {

    if (
        sample.VV === undefined ||
        sample.VV <= 0
    ) {

        return [0, 0, 0];

    }

    var vv = 10.0 * Math.log10(
        Math.max(
            sample.VV,
            0.000001
        )
    );

    var normalized =
        (vv + 28.0) / 20.0;

    normalized = Math.max(
        0.0,
        Math.min(
            1.0,
            normalized
        )
    );

    var enhanced =
        Math.pow(
            normalized,
            0.85
        );

    var gray =
        enhanced * 255.0;

    return [
        gray,
        gray,
        gray
    ];

}
"""


# ============================================================
# PROCESS SENTINEL-1 IMAGE
# ============================================================

async def _process_sentinel1_image(
    bbox,
    acquisition_datetime,
):
    """
    Process one Sentinel-1 acquisition.

    LINEAR_POWER is intentionally used here.
    Do not change this to DB/dB units because the
    current Sentinel Hub setup previously rejected them.
    """

    token = await get_access_token()

    process_payload = {
        "input": {
            "bounds": {
                "bbox": bbox
            },

            "data": [
                {
                    "type": "sentinel-1-grd",

                    "dataFilter": {
                        "timeRange": {
                            "from": acquisition_datetime,
                            "to": acquisition_datetime,
                        },

                        "acquisitionMode": "IW",

                        "mosaickingOrder": "mostRecent",
                    },

                    "processing": {
                        "orthorectify": True
                    },
                }
            ],
        },

        "output": {
            "width": 1024,
            "height": 1024,

            "responses": [
                {
                    "identifier": "default",

                    "format": {
                        "type": "image/png"
                    },
                }
            ],
        },

        "evalscript": SENTINEL1_VV_EVALSCRIPT,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            PROCESS_URL,
            json=process_payload,
            headers=headers,
            timeout=120,
        )

    if response.status_code != 200:
        raise RuntimeError(
            "Sentinel Hub image request failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    content_type = (
        response.headers
        .get("content-type", "")
        .lower()
    )

    if "image" not in content_type:
        raise RuntimeError(
            "Sentinel Hub returned a "
            "non-image response: "
            f"{response.text}"
        )

    return response.content


# ============================================================
# CURRENT / LATEST SENTINEL-1 IMAGE
# ============================================================

async def get_sentinel1_image(
    bbox
):
    """
    Get the latest available Sentinel-1 image
    for the requested area.

    Searches the last 30 days and lets Sentinel Hub
    select the most recent compatible acquisition.
    """

    token = await get_access_token()

    now = datetime.now(
        timezone.utc
    )

    start = (
        now -
        timedelta(days=30)
    )

    start_time = start.strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    end_time = now.strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    process_payload = {
        "input": {
            "bounds": {
                "bbox": bbox
            },

            "data": [
                {
                    "type": "sentinel-1-grd",

                    "dataFilter": {
                        "timeRange": {
                            "from": start_time,
                            "to": end_time,
                        },

                        "acquisitionMode": "IW",

                        "mosaickingOrder": "mostRecent",
                    },

                    "processing": {
                        "orthorectify": True
                    },
                }
            ],
        },

        "output": {
            "width": 1024,
            "height": 1024,

            "responses": [
                {
                    "identifier": "default",

                    "format": {
                        "type": "image/png"
                    },
                }
            ],
        },

        "evalscript": SENTINEL1_VV_EVALSCRIPT,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            PROCESS_URL,
            json=process_payload,
            headers=headers,
            timeout=120,
        )

    if response.status_code != 200:
        raise RuntimeError(
            "Sentinel Hub image request failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    content_type = (
        response.headers
        .get("content-type", "")
        .lower()
    )

    if "image" not in content_type:
        raise RuntimeError(
            "Sentinel Hub returned a "
            "non-image response: "
            f"{response.text}"
        )

    return response.content