import ee
import pandas as pd

# Initialize Earth Engine
ee.Initialize(project="firewatch-464011")

# Example DataFrame with coordinates (latitude, longitude)
df = pd.DataFrame({
    'latitude': [-33.8688, -37.8136, 51.5074],
    'longitude': [151.2093, 144.9631, -0.1278]
})

# Load MODIS MCD12Q1 Land Cover dataset (year 2019)
modis_landcover = ee.Image('MODIS/006/MCD12Q1/2019_01_01').select('LC_Type1')

def get_landcover_class(lat, lon):
    """Get MODIS land cover class for a single point."""
    point = ee.Geometry.Point(lon, lat)
    # Sample the land cover image at the point with a scale of 500m
    sample = modis_landcover.sample(region=point, scale=500).first()
    if sample is None:
        return None
    lc_class = sample.get('LC_Type1').getInfo()
    return lc_class

# Apply to each row in the DataFrame
df['landcover_class'] = df.apply(lambda row: get_landcover_class(row['latitude'], row['longitude']), axis=1)

print(df)
