import { z } from 'zod';

import { DestinationSchema } from './destination';

// ─── Schema ───────────────────────────────────
export const TripStatusSchema = z.enum(['draft', 'planned', 'active', 'completed', 'cancelled']);
export type TripStatus = z.infer<typeof TripStatusSchema>;

export const ItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  date: z.string().datetime().optional(),
  activities: z.array(z.string()),
  accommodation: z.string().optional(),
  notes: z.string().optional(),
});

export const TripSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  chatId: z.string().uuid().optional(),
  title: z.string().min(1),
  destination: DestinationSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: TripStatusSchema.default('draft'),
  itinerary: z.array(ItineraryDaySchema).default([]),
  estimatedBudget: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('TRY'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type Trip = z.infer<typeof TripSchema>;
export type TripInsert = Pick<Trip, 'userId' | 'title' | 'destination'> &
  Partial<Omit<Trip, 'id' | 'userId' | 'title' | 'destination' | 'createdAt' | 'updatedAt'>>;
