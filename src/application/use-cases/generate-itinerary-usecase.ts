import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';

import { Trip } from '../../domain/entities/trip';
import { Failure, Failures } from '../../domain/failures/failure';

const GenerateItineraryInputSchema = z.object({
  userId: z.string().uuid(),
  chatId: z.string().uuid().optional(),
  destinationName: z.string().min(1, 'Destinasyon adı boş olamaz.'),
  durationDays: z.number().int().positive().max(30, 'En fazla 30 günlük plan oluşturulabilir.'),
  budget: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('TRY'),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

export class GenerateItineraryUseCase {
  async execute(input: GenerateItineraryInput): Promise<Result<Trip, Failure>> {
    // 1. Input validation
    const parsed = GenerateItineraryInputSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Geçersiz giriş.';
      return err(Failures.validationError(message));
    }

    const mockTrip: Trip = {
      id: crypto.randomUUID(),
      userId: parsed.data.userId,
      chatId: parsed.data.chatId,
      title: `${parsed.data.destinationName} — ${parsed.data.durationDays} Günlük Plan`,
      destination: {
        id: crypto.randomUUID(),
        name: parsed.data.destinationName,
        country: 'Bilinmiyor',
        tags: [],
      },
      status: 'draft',
      itinerary: Array.from({ length: parsed.data.durationDays }, (_, i) => ({
        day: i + 1,
        activities: [`Gün ${i + 1}: Keşif`],
      })),
      estimatedBudget: parsed.data.budget,
      currency: parsed.data.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ok(mockTrip);
  }
}
