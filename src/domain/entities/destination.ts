import { z } from 'zod';

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const WeatherInfoSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  icon: z.string().optional(),
});

export const DestinationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  country: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  coordinates: CoordinatesSchema.optional(),
  weatherInfo: WeatherInfoSchema.optional(),
  tags: z.array(z.string()).default([]),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type WeatherInfo = z.infer<typeof WeatherInfoSchema>;
export type Destination = z.infer<typeof DestinationSchema>;
