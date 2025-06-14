import { csv } from "d3";

export interface DataPoint {
  name: string;
  latitude: number;
  longitude: number;
  value: number;
  category: string;
}

export class DataProcessor {
  static async loadCSV(filePath: string): Promise<DataPoint[]> {
    try {
      const data = await csv(filePath);
      return data
        .map((d) => ({
          name: d.name || "",
          latitude: parseFloat(d.latitude || "0"),
          longitude: parseFloat(d.longitude || "0"),
          value: parseFloat(d.value || "0"),
          category: d.category || "unknown",
        }))
        .filter((d) => !isNaN(d.latitude) && !isNaN(d.longitude));
    } catch (error) {
      console.error("Error loading CSV:", error);
      return [];
    }
  }

  static processDataForChoropleth(data: DataPoint[]): {
    [key: string]: number;
  } {
    const processed: { [key: string]: number } = {};
    data.forEach((point) => {
      if (processed[point.category]) {
        processed[point.category] += point.value;
      } else {
        processed[point.category] = point.value;
      }
    });
    return processed;
  }

  static getValueRanges(data: DataPoint[]): [number, number][] {
    const values = data.map((d) => d.value).sort((a, b) => a - b);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / 5;

    return Array.from({ length: 5 }, (_, i) => [
      Math.round(min + i * step),
      Math.round(min + (i + 1) * step),
    ]);
  }

  static getColorForValue(
    value: number,
    ranges: [number, number][],
    colors: string[],
  ): string {
    for (let i = 0; i < ranges.length; i++) {
      if (value >= ranges[i][0] && value <= ranges[i][1]) {
        return colors[i] || colors[colors.length - 1];
      }
    }
    return colors[0];
  }
}

export default DataProcessor;
