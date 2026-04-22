import { z } from 'zod';

// ─── Widget Data Schemas ──────────────────────────────────────────────────────

export const DestinationCardDataSchema = z.object({
  name: z.string(),
  country: z.string(),
  description: z.string(),
  highlights: z.array(z.string()).default([]),
  weather: z
    .object({
      temperature: z.number(),
      condition: z.string(),
    })
    .optional(),
});

export const HotelCardDataSchema = z.object({
  name: z.string(),
  location: z.string(),
  pricePerNight: z.number(),
  currency: z.string().default('TRY'),
  stars: z.number().min(1).max(5),
  description: z.string(),
  amenities: z.array(z.string()).default([]),
});

export const TicketCardDataSchema = z.object({
  airline: z.string(),
  from: z.string(),
  to: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  price: z.number(),
  currency: z.string().default('TRY'),
  class: z.string().default('Ekonomi'),
});

export const RouteStopSchema = z.object({
  name: z.string(),
  duration: z.string(),
  description: z.string(),
});

export const RouteWidgetDataSchema = z.object({
  title: z.string(),
  totalDuration: z.string(),
  stops: z.array(RouteStopSchema),
});

// ─── Widget Type Union ────────────────────────────────────────────────────────

export const WIDGET_TYPES = ['DestinationCard', 'HotelCard', 'TicketCard', 'RouteWidget'] as const;
export type WidgetType = (typeof WIDGET_TYPES)[number];

// ─── Parsed Widget Item ───────────────────────────────────────────────────────

export type DestinationCardData = z.infer<typeof DestinationCardDataSchema>;
export type HotelCardData = z.infer<typeof HotelCardDataSchema>;
export type TicketCardData = z.infer<typeof TicketCardDataSchema>;
export type RouteWidgetData = z.infer<typeof RouteWidgetDataSchema>;

// ─── Helpers — parse widgetData.items from message metadata ──────────────────

export function parseDestinationItems(items: unknown[]): DestinationCardData[] {
  return items.flatMap((item) => {
    const parsed = DestinationCardDataSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseHotelItems(items: unknown[]): HotelCardData[] {
  return items.flatMap((item) => {
    const parsed = HotelCardDataSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseTicketItems(items: unknown[]): TicketCardData[] {
  return items.flatMap((item) => {
    const parsed = TicketCardDataSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseRouteItems(items: unknown[]): RouteWidgetData[] {
  return items.flatMap((item) => {
    const parsed = RouteWidgetDataSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}
