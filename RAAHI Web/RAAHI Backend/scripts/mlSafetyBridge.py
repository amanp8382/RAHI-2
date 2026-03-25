import importlib.util
import json
import os
import sys
from pathlib import Path
from geopy.geocoders import Nominatim


def reverse_location_name(lat: float, lng: float) -> str:
    geolocator = Nominatim(user_agent="raahi_live_safety_bridge")
    location = geolocator.reverse((lat, lng), language="en", exactly_one=True, timeout=10)
    if not location:
        return ""

    address = location.raw.get("address", {})
    return (
        address.get("city")
        or address.get("town")
        or address.get("suburb")
        or address.get("state_district")
        or address.get("county")
        or address.get("state")
        or location.address.split(",")[0]
    )


def main():
    if len(sys.argv) < 3:
      raise ValueError("Usage: mlSafetyBridge.py <lat> <lng> [locationName]")

    lat = float(sys.argv[1])
    lng = float(sys.argv[2])
    location_name = sys.argv[3] if len(sys.argv) > 3 else ""

    repo_root = Path(__file__).resolve().parents[2]
    model_dir = repo_root / "ML model" / "ML Model" / "venv"
    model_file = model_dir / "main.py"

    if not model_file.exists():
        raise FileNotFoundError(f"ML model entrypoint not found at {model_file}")

    os.chdir(model_dir)

    spec = importlib.util.spec_from_file_location("raahi_ml_model", model_file)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)

    resolved_location_name = reverse_location_name(lat, lng) or location_name
    result = module.calculate_safety_score(lat, lng, resolved_location_name)

    payload = {
        "score": result["final_score"],
        "label": "Model prediction",
        "threatLevel": result["band"],
        "confidence": 0.95,
        "summary": f"Safety score generated for {resolved_location_name or 'current live location'} using the trained ML model.",
        "resolvedLocationName": resolved_location_name,
        "factors": [
            {"label": "Weather", "value": result["breakdown"]["weather"], "impact": "positive" if result["breakdown"]["weather"] >= 60 else "negative"},
            {"label": "Incident", "value": result["breakdown"]["incident"], "impact": "positive" if result["breakdown"]["incident"] >= 60 else "negative"},
            {"label": "Crowd", "value": result["breakdown"]["crowd"], "impact": "positive" if result["breakdown"]["crowd"] >= 60 else "negative"},
            {"label": "News Sentiment", "value": result["breakdown"]["sentiment"], "impact": "positive" if result["breakdown"]["sentiment"] >= 60 else "negative"},
            {"label": "Road", "value": result["breakdown"]["road"], "impact": "positive" if result["breakdown"]["road"] >= 60 else "negative"},
        ],
        "recommendations": [
            f"Current band: {result['band']}",
            "Check police dashboard if the band moves toward Unsafe.",
            "Keep live location turned on while travelling."
        ],
        "rawModel": result,
    }

    print(json.dumps(payload))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
