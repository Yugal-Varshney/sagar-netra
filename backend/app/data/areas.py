# ==================================================
# Sagar Netra - PREDEFINED MONITORING AREAS
# ==================================================
#
# All AOIs are fixed square regions.
#
# bbox format:
# [min_longitude, min_latitude, max_longitude, max_latitude]
#
# Approximate size:
# ~0.45° × 0.45° (~50 km × 50 km)
#
# ==================================================


AREAS = {

    # --------------------------------------------------
    # 1. GULF OF KUTCH
    # --------------------------------------------------

    "gulf_of_kutch": {
        "id": "gulf_of_kutch",

        "name": "Gulf of Kutch",

        "description": (
            "Offshore Gujarat petroleum and major shipping corridor"
        ),

        "bbox": [
            69.85,
            22.45,
            70.30,
            22.90,
        ],

        "coverage_km2": 2500,

        "region": "Arabian Sea",

        "risk_level": "HIGH",
    },


    # --------------------------------------------------
    # 2. MUMBAI OFFSHORE
    # --------------------------------------------------

    "mumbai_offshore": {
        "id": "mumbai_offshore",

        "name": "Mumbai Offshore",

        "description": (
            "Mumbai coastal shipping and offshore petroleum region"
        ),

        "bbox": [
            72.55,
            18.55,
            73.00,
            19.00,
        ],

        "coverage_km2": 2500,

        "region": "Arabian Sea",

        "risk_level": "HIGH",
    },


    # --------------------------------------------------
    # 3. CHENNAI OFFSHORE
    # --------------------------------------------------

    "chennai_offshore": {
        "id": "chennai_offshore",

        "name": "Chennai Offshore",

        "description": (
            "Chennai coastal shipping corridor in the Bay of Bengal"
        ),

        "bbox": [
            80.00,
            12.75,
            80.45,
            13.20,
        ],

        "coverage_km2": 2500,

        "region": "Bay of Bengal",

        "risk_level": "MEDIUM",
    },
}