import React, { useState, useEffect } from "react";
import MapContainer from "./MapContainer";
import { DataProcessor, DataPoint } from "./DataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Map } from "lucide-react";

function Home() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"choropleth" | "dot">("dot");
  const [fileInputKey, setFileInputKey] = useState(0);

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sampleData = await DataProcessor.loadCSV("/sample-data.csv");
      setData(sampleData);
    } catch (err) {
      setError("Failed to load sample data");
      console.error("Error loading sample data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const blob = new Blob([text], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const csvData = await DataProcessor.loadCSV(url);

      if (csvData.length === 0) {
        setError(
          "No valid data found in CSV file. Please ensure it has columns: name, latitude, longitude, value, category",
        );
      } else {
        setData(csvData);
      }

      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to process CSV file");
      console.error("Error processing CSV:", err);
    } finally {
      setLoading(false);
      // Reset file input
      setFileInputKey((prev) => prev + 1);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                NSW Data Visualization
              </h1>
              <p className="text-sm text-gray-600">
                Interactive map showing data points across New South Wales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                key={fileInputKey}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-64"
                disabled={loading}
              />
              <Button
                onClick={loadSampleData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load Sample"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Stats Card */}
      {data.length > 0 && (
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Data Points: <strong>{data.length}</strong>
                  </span>
                  <span>
                    Categories:{" "}
                    <strong>{new Set(data.map((d) => d.category)).size}</strong>
                  </span>
                  <span>
                    Value Range:{" "}
                    <strong>
                      {Math.min(...data.map((d) => d.value))} -{" "}
                      {Math.max(...data.map((d) => d.value))}
                    </strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-full">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  data={data}
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;
