import requests
from io import StringIO
import numpy as np
import joblib
from sklearn.neighbors import BallTree
from tqdm import tqdm
from datetime import datetime
import pytz
import pandas as pd
import ee

# Fetch NASA FIRMS Hotspots for NSW
def fetch_nsw_hotspots():
    """
    BBOX:
    Australia: [112.9, -43.7, 153.6, -10.7]
    NSW: [140.999, -37.505, 153.638, -28.157]
    """
    MAP_KEY = "6c8a65ccb7fd9e0e7caef47ad2c3fb49"
    bbox = [112.9, -43.7, 153.6, -10.7]  # NSW bbox
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_NOAA21_NRT/{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}/1"
    print(url)
    response = requests.get(url)
    response.raise_for_status()
    df = pd.read_csv(StringIO(response.text))
    print(df.head())
    return df

# Filter out ocean and urban areas using OpenLandMap (WMS GetFeatureInfo)
def filter_non_burnable(df):  
    ee.Initialize(project="firewatch-464011")

    # Load MODIS MCD12Q1 Land Cover dataset (year 2019)
    modis_landcover = ee.Image('MODIS/006/MCD12Q1/2019_01_01').select('LC_Type1')

    def get_landcover_class(lat, lon):
        point = ee.Geometry.Point(lon, lat)
        sample = modis_landcover.sample(region=point, scale=500).first()
        if sample is None:
            return None
        lc_class = sample.get('LC_Type1').getInfo()
        return lc_class

    # Apply to each row in the DataFrame
    df['LandCover'] = df.apply(lambda row: get_landcover_class(row['latitude'], row['longitude']), axis=1)
    non_burnable = [0,7,11,13,15,16]
    df = df[~df["LandCover"].isin(non_burnable)]

    print(df.head())
    return df

# Fetch weather data for each hotspot using Open-Meteo
def fetch_weather(df):
    weather_url = "https://api.open-meteo.com/v1/forecast"
    weather_data = []
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Fetching weather"):
        params = {
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "hourly": "temperature_2m,relative_humidity_2m,precipitation,soil_moisture_3_9cm,shortwave_radiation,windspeed_10m",
            "timezone": "auto"
        }
        try:
            r = requests.get(weather_url, params=params, timeout=10)
            data = r.json().get("hourly", {})
            weather_data.append({
                "Precipitation": data.get("precipitation", [None])[0],
                "RelativeHumidity": data.get("relative_humidity_2m", [None])[0],
                "SolarWaterContent": data.get("soil_moisture_3_9cm", [None])[0],
                "SolarRadiation": data.get("shortwave_radiation", [None])[0],
                "Temperature": data.get("temperature_2m", [None])[0],
                "WindSpeed": data.get("windspeed_10m", [None])[0],
            })
        except Exception:
            weather_data.append({
                "Precipitation": None,
                "RelativeHumidity": None,
                "SolarWaterContent": None,
                "SolarRadiation": None,
                "Temperature": None,
                "WindSpeed": None,
            })
    weather_df = pd.DataFrame(weather_data)
    return pd.concat([df.reset_index(drop=True), weather_df], axis=1)

# Calculate number of nearby hotspots within 0.1 km
def calculate_nearby_hotspots(df, radius_km=0.1):
    coords = np.radians(df[["latitude", "longitude"]].values)
    tree = BallTree(coords, metric="haversine")
    counts = []
    for coord in tqdm(coords, desc="Counting nearby hotspots"):
        ind = tree.query_radius([coord], r=radius_km / 6371.0)  # Earth radius ~6371 km
        counts.append(len(ind[0]) - 1)  # exclude self
    df["NearbyHotspots"] = counts
    return df

# Predict
def predict_bushfire(df, model_path="xgb_wildfire_model.pkl", scaler_path="scaler.pkl"):
    features = [
        "bright_ti4",
        "frp",
        "Precipitation",
        "RelativeHumidity",
        "SolarWaterContent",
        "SolarRadiation",
        "Temperature",
        "WindSpeed",
        "NearbyHotspots"
    ]
    df_features = df[features].copy()

    scaler = joblib.load(scaler_path)
    model = joblib.load(model_path)

    X_scaled = scaler.transform(df_features)
    predictions = model.predict(X_scaled)
    df["value"] = np.clip(predictions, 0, 100)
    return df

# guillotine
if __name__ == "__main__":
    df = fetch_nsw_hotspots()
    df = filter_non_burnable(df)
    df = fetch_weather(df)
    df = calculate_nearby_hotspots(df)
    df = predict_bushfire(df)
    df = df[['longitude','latitude','value','LandCover']]

    # Save results
    time = datetime.now(pytz.timezone('Australia/Sydney'))
    print(time.strftime("%Y%m%d%H%M%S"))
    date = time.strftime("%Y%m%d%H%M%S")
    df.to_csv(f'hotspots{date}.csv', index=False)
    print(f"Results saved to hotspots{date}.csv")