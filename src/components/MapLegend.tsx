import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MapLegendProps {
  type: "choropleth" | "dot";
  colorScale?: string[];
  valueRanges?: [number, number][];
  dotSizes?: number[];
  dotColors?: string[];
  title?: string;
}

const MapLegend = ({
  type = "choropleth",
  colorScale = [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#084594",
  ],
  valueRanges = [
    [0, 10],
    [10, 20],
    [20, 30],
    [30, 40],
    [40, 50],
    [50, 60],
    [60, 70],
    [70, 80],
  ],
  dotSizes = [4, 6, 8, 10, 12],
  dotColors = ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
  title = "Legend",
}: MapLegendProps) => {
  return (
    <Card className="w-48 md:w-56 bg-white shadow-md absolute bottom-4 right-4 z-10">
      <CardContent className="p-3">
        <h3 className="text-sm font-medium mb-2">{title}</h3>

        {type === "choropleth" ? (
          <div className="space-y-1">
            {colorScale.map((color, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-4 h-4 mr-2"
                  style={{ backgroundColor: color }}
                />
                <span>
                  {valueRanges[index]
                    ? `${valueRanges[index][0]} - ${valueRanges[index][1]}`
                    : `Range ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {dotSizes.map((size, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                  <div
                    className="rounded-full"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: dotColors[index] || "#000",
                    }}
                  />
                </div>
                <span>
                  {valueRanges[index]
                    ? `${valueRanges[index][0]} - ${valueRanges[index][1]}`
                    : `Size ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapLegend;
