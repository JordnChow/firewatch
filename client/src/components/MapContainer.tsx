import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { DataPoint, DataProcessor } from "./DataProcessor";
import MapLegend from "./MapLegend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MapContainerProps {
  data?: DataPoint[];
  mapType?: "choropleth" | "dot";
  onMapTypeChange?: (type: "choropleth" | "dot") => void;
}

const MapContainer = ({
  data = [],
  mapType = "dot",
  onMapTypeChange = () => {},
}: MapContainerProps) => {
  const [valueRanges, setValueRanges] = useState<[number, number][]>([]);
  const [colorScale] = useState([
    "#feebe2",
    "#fbb4b9",
    "#f768a1",
    "#c51b8a",
    "#7a0177",
  ]);

  // NSW bounds
  const nswBounds = new LatLngBounds(
    [-37.5, 140.9], // Southwest corner
    [-28.1, 153.6], // Northeast corner
  );

  const nswCenter: [number, number] = [-32.5, 147.0];

  useEffect(() => {
    if (data.length > 0) {
      const ranges = DataProcessor.getValueRanges(data);
      setValueRanges(ranges);
    }
  }, [data]);

  const getMarkerColor = (value: number): string => {
    return DataProcessor.getColorForValue(value, valueRanges, colorScale);
  };

  const getMarkerSize = (value: number): number => {
    if (valueRanges.length === 0) return 8;
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const normalized = (value - minValue) / (maxValue - minValue);
    return 6 + normalized * 12; // Size between 6 and 18
  };

  return (
    <div className="relative w-full h-full bg-white">
      {/* Map Type Toggle */}
      <Card className="absolute top-4 left-4 z-[1000] bg-white shadow-lg border">
        <CardContent className="p-3">
          <div className="flex gap-2">
            <Button
              variant={mapType === "dot" ? "default" : "outline"}
              size="sm"
              onClick={() => onMapTypeChange("dot")}
              className="text-xs px-3 py-1"
            >
              Dot Map
            </Button>
            <Button
              variant={mapType === "choropleth" ? "default" : "outline"}
              size="sm"
              onClick={() => onMapTypeChange("choropleth")}
              className="text-xs px-3 py-1"
            >
              Choropleth
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="w-full h-full">
        <LeafletMapContainer
          center={nswCenter}
          zoom={6}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          maxBounds={nswBounds}
          maxBoundsViscosity={1.0}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapType === "dot" &&
            data.map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.latitude, point.longitude]}
                radius={getMarkerSize(point.value)}
                fillColor={getMarkerColor(point.value)}
                color="white"
                weight={2}
                opacity={1}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">{point.name}</h3>
                    <p>Category: {point.category}</p>
                    <p>Value: {point.value}</p>
                    <p>
                      Coordinates: {point.latitude.toFixed(4)},{" "}
                      {point.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {mapType === "choropleth" &&
            data.map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.latitude, point.longitude]}
                radius={15}
                fillColor={getMarkerColor(point.value)}
                color={getMarkerColor(point.value)}
                weight={3}
                opacity={0.7}
                fillOpacity={0.5}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">{point.name}</h3>
                    <p>Category: {point.category}</p>
                    <p>Value: {point.value}</p>
                    <p>
                      Coordinates: {point.latitude.toFixed(4)},{" "}
                      {point.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </LeafletMapContainer>
      </div>

      {/* Legend */}
      {data.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <MapLegend
            type={mapType}
            colorScale={colorScale}
            valueRanges={valueRanges}
            title={`${mapType === "dot" ? "Dot" : "Choropleth"} Map Legend`}
          />
        </div>
      )}
    </div>
  );
};

export default MapContainer;
