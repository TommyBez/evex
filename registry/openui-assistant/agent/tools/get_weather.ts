import { defineTool } from "eve/tools";
import { z } from "zod";

const knownTemperaturesCelsius: Record<string, number> = {
  berlin: 16,
  london: 14,
  mumbai: 33,
  "new york": 25,
  paris: 19,
  "san francisco": 18,
  sydney: 27,
  tokyo: 22,
};

const weatherConditions = [
  "Clear Skies",
  "Cloudy",
  "Light Rain",
  "Partly Cloudy",
  "Sunny",
] as const;

const getWeatherInput = z.object({
  location: z.string().min(1).describe("City name, for example Tokyo"),
});

export type GetWeatherInput = z.infer<typeof getWeatherInput>;

export type GetWeatherOutput = {
  condition: string;
  forecast: Array<{
    condition: string;
    day: string;
    high: number;
    low: number;
  }>;
  humidity_percent: number;
  location: string;
  temperature_celsius: number;
  temperature_fahrenheit: number;
  wind_speed_kmh: number;
};

function pickCondition(index: number): string {
  return weatherConditions[index % weatherConditions.length] ?? "Partly Cloudy";
}

function resolveTemperatureCelsius(location: string): number {
  const normalized = location.trim().toLowerCase();
  const known = knownTemperaturesCelsius[normalized];

  if (known !== undefined) {
    return known;
  }

  let hash = 0;

  for (const character of normalized) {
    hash = (hash + character.charCodeAt(0)) % 30;
  }

  return 5 + hash;
}

export default defineTool({
  description:
    "Get current weather and a short forecast for a city. Use before rendering weather cards or charts.",
  inputSchema: getWeatherInput,
  execute({ location }): GetWeatherOutput {
    const temperatureCelsius = resolveTemperatureCelsius(location);
    const condition = pickCondition(location.length);

    return {
      location,
      temperature_celsius: temperatureCelsius,
      temperature_fahrenheit: Math.round(temperatureCelsius * 1.8 + 32),
      condition,
      humidity_percent: 40 + (location.length % 40),
      wind_speed_kmh: 5 + (location.length % 25),
      forecast: [
        {
          day: "Tomorrow",
          high: temperatureCelsius + 2,
          low: temperatureCelsius - 4,
          condition: "Partly Cloudy",
        },
        {
          day: "Day After",
          high: temperatureCelsius + 1,
          low: temperatureCelsius - 3,
          condition: "Sunny",
        },
      ],
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: output,
    };
  },
});
