"""
Refined safety scoring engine with geocoding and multiple accident datasets:
- Loads historical CSVs (accident_prediction_india.csv, Natural_Incient.csv, Road.csv, Road_accident_1.csv, Road_accident_2.csv, driverresponse.csv, datafile.csv)
- Provides modular functions to fetch weather, news, incident history, crowd level, and road conditions
- Computes a decomposed safety score (0-100) and risk band
- Supports location name input (via geocoding to lat/lon)
- Provides predict_path_safety(path) to compute per-segment & path safety
- Supports both MOCK mode (fast testing) and LIVE mode (real API calls; set keys)
"""

from __future__ import annotations
import os
import random
import json
from typing import List, Tuple, Dict, Any

import pandas as pd
import requests
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from dateutil import parser as dateparser
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box

console = Console()

# -------------------------
# Configuration
# -------------------------
DATA_DIR = "./"
ACCIDENTS_CSV = os.path.join(DATA_DIR, "accident_prediction_india.csv")
DISASTERS_CSV = os.path.join(DATA_DIR, "Natural_Disasters_in_India.csv")
ROAD_CSV = os.path.join(DATA_DIR, "Road.csv")
ROAD_ACCIDENT_1_CSV = os.path.join(DATA_DIR, "Road_accident_1.csv")
ROAD_ACCIDENT_2_CSV = os.path.join(DATA_DIR, "Road_accident_2.csv")
DRIVER_RESPONSE_CSV = os.path.join(DATA_DIR, "driverresponse.csv")  # NEW
DATAFILE_CSV = os.path.join(DATA_DIR, "datafile.csv")               # NEW

OPENWEATHER_API_KEY = "200577e014c1c4c3d23e9474ed18dc2c"
NEWS_API_KEY = "877120369205426b83dacb6a4e2f1e3c"
USE_REAL_APIS = True

WEIGHTS = {
    "weather": 0.18,
    "incident": 0.35,
    "crowd": 0.12,
    "sentiment": 0.15,
    "road": 0.20,
}

PATH_AGG_METHOD = "mean"

RISK_BANDS = [
    (0.0, 20.0, "Very Unsafe"),
    (20.0, 40.0, "Unsafe"),
    (40.0, 60.0, "Moderate"),
    (60.0, 80.0, "Safe"),
    (80.0, 100.0, "Very Safe"),
]

# -------------------------
# Load CSVs safely
# -------------------------
def load_csv_safe(path: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(path)
        print(f"Loaded {path} ({len(df)} rows).")
        return df
    except FileNotFoundError:
        print(f"Warning: {path} not found. Continuing with empty dataframe.")
        return pd.DataFrame()

def _norm_cols(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.strip().lower() for c in df.columns]
    return df

accident_df = _norm_cols(load_csv_safe(ACCIDENTS_CSV))
disasters_df = _norm_cols(load_csv_safe(DISASTERS_CSV))
road_df = _norm_cols(load_csv_safe(ROAD_CSV))
road_accident_1_df = _norm_cols(load_csv_safe(ROAD_ACCIDENT_1_CSV))
road_accident_2_df = _norm_cols(load_csv_safe(ROAD_ACCIDENT_2_CSV))
driver_response_df = _norm_cols(load_csv_safe(DRIVER_RESPONSE_CSV))  # NEW
datafile_df = _norm_cols(load_csv_safe(DATAFILE_CSV))                # NEW

# -------------------------
# Cache helpers
# -------------------------
CACHE_DIR = "./.cache_safety"
os.makedirs(CACHE_DIR, exist_ok=True)

def cache_get(key: str) -> Any:
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(path):
        try:
            return json.load(open(path, "r"))
        except Exception:
            return None
    return None

def cache_set(key: str, value: Any):
    path = os.path.join(CACHE_DIR, f"{key}.json")
    try:
        json.dump(value, open(path, "w"), default=str)
    except Exception:
        pass

# -------------------------
# Geocoding
# -------------------------
geolocator = Nominatim(user_agent="safety_score_app")

def get_lat_lon_from_name(location_name: str) -> tuple[float, float] | None:
    try:
        loc = geolocator.geocode(location_name, timeout=10)
        if loc:
            return (loc.latitude, loc.longitude)
        else:
            print(f"Could not geocode '{location_name}'.")
            return None
    except Exception as e:
        print(f"Geocoding error for '{location_name}': {e}")
        return None

# -------------------------
# Weather
# -------------------------
def _mock_weather(lat: float, lon: float) -> Dict[str, Any]:
    temp = random.uniform(20, 32)
    precip = random.choice([0, 0, 0, random.uniform(0.5, 5), random.uniform(5, 20)])
    alerts = [] if random.random() > 0.15 else [{"event": "Local storm warning"}]
    return {"temperature": round(temp, 1), "precipitation": round(precip, 2), "alerts": alerts}

def get_weather_data(lat: float, lon: float, use_cache: bool = True) -> Dict[str, Any]:
    cache_key = f"weather_{round(lat,4)}_{round(lon,4)}"
    if use_cache:
        cached = cache_get(cache_key)
        if cached:
            return cached

    if USE_REAL_APIS and OPENWEATHER_API_KEY:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather?"
            f"lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        )
        try:
            resp = requests.get(url, timeout=6)
            resp.raise_for_status()
            j = resp.json()
            rain_1h = j.get("rain", {}).get("1h", 0.0)
            alerts = j.get("alerts", [])
            wd = {"temperature": j["main"]["temp"], "precipitation": rain_1h, "alerts": alerts}
            cache_set(cache_key, wd)
            return wd
        except Exception as e:
            print(f"Weather API failed: {e} — using mock data.")
            wd = _mock_weather(lat, lon)
            cache_set(cache_key, wd)
            return wd
    else:
        wd = _mock_weather(lat, lon)
        cache_set(cache_key, wd)
        return wd

# -------------------------
# Incident data (all 3 accident datasets)
# -------------------------
def get_incident_data(area_name: str = "", lat: float | None = None, lon: float | None = None) -> Dict[str, Any]:
    real_time_incidents = random.randint(0, 3)
    historical_rate = 0.0

    def _count_accidents(df: pd.DataFrame) -> float:
        try:
            if df.empty: return 0.0
            cols = [c.lower() for c in df.columns]
            city_col = None
            for candidate in ["city", "place", "location", "town", "state"]:
                if candidate in cols:
                    city_col = df.columns[cols.index(candidate)]
                    break
            if city_col and area_name:
                sel = df[df[city_col].astype(str).str.lower() == area_name.lower()]
                return len(sel)
        except Exception:
            return 0.0
        return 0.0

    total_hist = (
        _count_accidents(accident_df)
        + _count_accidents(road_accident_1_df)
        + _count_accidents(road_accident_2_df)
    )
    historical_rate = (total_hist / max(1, len(accident_df))) * 1000
    return {"real_time_incidents": int(real_time_incidents), "historical_rate": float(historical_rate)}

# -------------------------
# Crowd data
# -------------------------
def get_crowd_data(area_name: str = "", lat: float | None = None, lon: float | None = None) -> Dict[str, Any]:
    if area_name:
        if any(tok in area_name.lower() for tok in ["delhi", "mumbai", "agra", "jaipur", "goa"]):
            level = "high"
        elif any(tok in area_name.lower() for tok in ["pune", "lucknow", "hyderabad"]):
            level = "medium"
        else:
            level = "low"
    else:
        level = random.choice(["low"] * 8 + ["medium"] * 2 + ["high"])
    numeric = {"low": 0.1, "medium": 0.5, "high": 0.85}[level]
    return {"tourist_level": level, "tourist_level_numeric": numeric}

# -------------------------
# News sentiment
# -------------------------
def _mock_news(area_name: str):
    sentiments = ["positive", "neutral", "negative"]
    choice = random.choices(sentiments, weights=[0.5, 0.3, 0.2])[0]
    neg_count = random.randint(0, 4) if choice == "negative" else random.randint(0, 1)
    return {"average_sentiment": choice, "negative_articles": neg_count}

def get_news_sentiment(area_name: str = "") -> Dict[str, Any]:
    cache_key = f"news_{area_name.replace(' ', '_').lower()}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    if USE_REAL_APIS and NEWS_API_KEY and area_name:
        url = f"https://newsapi.org/v2/everything?q={area_name}&pageSize=20&apiKey={NEWS_API_KEY}"
        try:
            resp = requests.get(url, timeout=6)
            resp.raise_for_status()
            j = resp.json()
            titles = [a.get("title", "") for a in j.get("articles", [])]
            neg_keywords = ["accident", "flood", "attack", "protest", "death", "storm", "evacuate"]
            neg_count = sum(1 for t in titles if any(k in (t or "").lower() for k in neg_keywords))
            avg_sent = "negative" if neg_count >= 2 else ("neutral" if neg_count == 1 else "positive")
            result = {"average_sentiment": avg_sent, "negative_articles": neg_count}
            cache_set(cache_key, result)
            return result
        except Exception as e:
            print(f"News API failed: {e} — using mock news.")
            res = _mock_news(area_name)
            cache_set(cache_key, res)
            return res
    else:
        res = _mock_news(area_name)
        cache_set(cache_key, res)
        return res

# -------------------------
# Road conditions
# -------------------------
def get_road_data(area_name: str = "") -> Dict[str, Any]:
    road_risk = 0.0
    try:
        if not road_df.empty and area_name and "city" in road_df.columns and "risk_score" in road_df.columns:
            sel = road_df[road_df["city"].astype(str).str.lower() == area_name.lower()]
            if not sel.empty:
                road_risk = sel["risk_score"].astype(float).mean()
    except Exception:
        road_risk = random.uniform(0, 50)
    return {"road_risk": float(road_risk)}

# -------------------------
# Scoring helpers
# -------------------------
def clamp(x: float, a: float = 0.0, b: float = 100.0) -> float:
    return max(a, min(b, x))

def band_for_score(score_0_100: float) -> str:
    for lo, hi, label in RISK_BANDS:
        if lo <= score_0_100 < hi:
            return label
    return RISK_BANDS[-1][2]

def _weather_to_score(weather: Dict[str, Any]) -> float:
    score = 100.0
    precip = float(weather.get("precipitation", 0.0))
    temp = float(weather.get("temperature", 25.0))
    alerts = weather.get("alerts", [])
    if precip >= 20: score -= 45
    elif precip >= 5: score -= 20
    elif precip >= 1: score -= 8
    if temp >= 40 or temp <= 2: score -= 12
    elif temp >= 35 or temp <= 5: score -= 6
    if alerts: score -= 40
    return clamp(score, 0.0, 100.0)

def _incident_to_score(incident: Dict[str, Any]) -> float:
    score = 100.0
    hist = float(incident.get("historical_rate", 0.0))
    realtime = int(incident.get("real_time_incidents", 0))
    if hist >= 30: score -= 45
    elif hist >= 10: score -= 25
    elif hist >= 3: score -= 10
    score -= realtime * 12
    return clamp(score, 0.0, 100.0)

def _crowd_to_score(crowd: Dict[str, Any]) -> float:
    numeric = float(crowd.get("tourist_level_numeric", 0.1))
    penalty = numeric * 40.0
    score = 100.0 - penalty
    return clamp(score, 0.0, 100.0)

def _sentiment_to_score(news: Dict[str, Any]) -> float:
    base = 100.0
    avg = news.get("average_sentiment", "neutral")
    neg = int(news.get("negative_articles", 0))
    if avg == "negative": base -= 15 + neg * 6
    elif avg == "neutral": base -= 4 + neg * 2
    else: base -= max(0, neg - 1) * 1.0
    return clamp(base, 0.0, 100.0)

def _road_to_score(road: Dict[str, Any]) -> float:
    risk = float(road.get("road_risk", 0.0))
    score = 100.0 - risk
    return clamp(score, 0.0, 100.0)

# -------------------------
# Main scoring function
# -------------------------
def calculate_safety_score(lat: float, lon: float, area_name: str = "") -> Dict[str, Any]:
    weather = get_weather_data(lat, lon)
    incident = get_incident_data(area_name, lat, lon)
    crowd = get_crowd_data(area_name, lat, lon)
    news = get_news_sentiment(area_name)
    road = get_road_data(area_name)

    sc_weather = _weather_to_score(weather)
    sc_incident = _incident_to_score(incident)
    sc_crowd = _crowd_to_score(crowd)
    sc_sentiment = _sentiment_to_score(news)
    sc_road = _road_to_score(road)

    final = (
        WEIGHTS["weather"] * sc_weather
        + WEIGHTS["incident"] * sc_incident
        + WEIGHTS["crowd"] * sc_crowd
        + WEIGHTS["sentiment"] * sc_sentiment
        + WEIGHTS["road"] * sc_road
    )
    final = clamp(final, 0.0, 100.0)
    band = band_for_score(final)

    return {
        "final_score": round(final, 1),
        "breakdown": {
            "weather": round(sc_weather, 1),
            "incident": round(sc_incident, 1),
            "crowd": round(sc_crowd, 1),
            "sentiment": round(sc_sentiment, 1),
            "road": round(sc_road, 1),
        },
        "weights": WEIGHTS,
        "band": band,
        "raw": {"weather": weather, "incident": incident, "crowd": crowd, "news": news, "road": road},
    }

# -------------------------
# Path safety helper
# -------------------------
def _segment_length_m(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    return geodesic(p1, p2).meters

def predict_path_safety(path: List[Tuple[float, float]], names: List[str] | None = None) -> Dict[str, Any]:
    if not path or len(path) < 2:
        raise ValueError("path must contain at least two coordinates")

    pts_names = names if names and len(names) == len(path) else ["" for _ in path]

    segment_infos = []
    point_scores = []

    for (lat, lon), area_name in zip(path, pts_names):
        info = calculate_safety_score(lat, lon, area_name)
        point_scores.append(info["final_score"])
        segment_infos.append({
            "point": (lat, lon),
            "score": info["final_score"],
            "breakdown": info["breakdown"],
            "raw": info["raw"]
        })

    if PATH_AGG_METHOD == "mean":
        path_score = float(sum(point_scores) / len(point_scores))
    elif PATH_AGG_METHOD == "length_weighted":
        total_length = 0.0
        weighted = 0.0
        for i in range(len(path) - 1):
            length = _segment_length_m(path[i], path[i + 1])
            mid_score = (point_scores[i] + point_scores[i + 1]) / 2.0
            weighted += mid_score * length
            total_length += length
        path_score = weighted / total_length if total_length > 0 else sum(point_scores) / len(point_scores)
    else:
        path_score = float(sum(point_scores) / len(point_scores))

    path_score = clamp(path_score, 0.0, 100.0)
    path_band = band_for_score(path_score)

    if path_score < 45:
        recommendation = "Path is risky — consider choosing a different route or delay travel."
    elif path_score < 60:
        recommendation = "Moderate risk — exercise caution and check live updates."
    else:
        recommendation = "Path appears reasonably safe."

    return {
        "segment_scores": segment_infos,
        "path_score": round(path_score, 1),
        "band": path_band,
        "recommendation": recommendation
    }

# -------------------------
# CLI
# -------------------------
def pretty_print_result(area: str, result: Dict[str, Any]):
    score = result["final_score"]
    band = result["band"]
    bd = result["breakdown"]

    console.rule(f"[bold cyan]Safety Score for [white]{area}")

    # Summary panel
    summary_table = Table(show_header=False, box=box.SIMPLE, expand=True)
    summary_table.add_row("[bold]Final score", f"[bold green]{score}/100")
    summary_table.add_row("[bold]Risk band", f"[bold yellow]{band}")

    breakdown_table = Table(title="Breakdown (0-100)", box=box.MINIMAL_DOUBLE_HEAD, expand=True)
    breakdown_table.add_column("Factor", style="bold cyan")
    breakdown_table.add_column("Score", justify="right")
    breakdown_table.add_row("Weather", f"{bd['weather']}")
    breakdown_table.add_row("Incident", f"{bd['incident']}")
    breakdown_table.add_row("Crowd", f"{bd['crowd']}")
    breakdown_table.add_row("News", f"{bd['sentiment']}")
    breakdown_table.add_row("Road", f"{bd['road']}")

    console.print(Panel(summary_table, title="[bold]Summary", border_style="bright_blue"))
    console.print(breakdown_table)

    console.print(Panel("Raw signals", style="bold", border_style="magenta"))
    console.print_json(data=result["raw"])  # pretty JSON of all underlying data


if __name__ == "__main__":
    console.print("[bold green]Safety Score CLI[/bold green] — type a city/area name to evaluate.")
    console.print("Type [bold]q[/bold] or press Enter on an empty line to exit.\n")

    while True:
        area_ex = input("Enter a location name (or 'q' to quit): ").strip()
        if not area_ex or area_ex.lower() in ("q", "quit", "exit"):
            console.print("[bold yellow]Goodbye![/bold yellow]")
            break

        coords = get_lat_lon_from_name(area_ex)
        if coords:
            lat_ex, lon_ex = coords
            console.print(
                f"\n[cyan]Computing safety score for[/cyan] [bold]{area_ex}[/bold] "
                f"([white]{lat_ex:.4f}, {lon_ex:.4f}) ..."
            )
            out = calculate_safety_score(lat_ex, lon_ex, area_ex)
            pretty_print_result(area_ex, out)
        else:
            console.print("[bold red]Could not find location. Please try again.[/bold red]")
