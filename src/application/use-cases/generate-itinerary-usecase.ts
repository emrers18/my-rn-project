import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';

import { Trip } from '../../domain/entities/trip';
import { Failure, Failures } from '../../domain/failures/failure';
import { supabaseAiDataSource } from '../../infrastructure/datasources/supabase-ai-datasource';

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
  constructor(private readonly aiDataSource: typeof supabaseAiDataSource = supabaseAiDataSource) {}

  async execute(input: GenerateItineraryInput): Promise<Result<Trip, Failure>> {
    // 1. Input validation
    const parsed = GenerateItineraryInputSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Geçersiz giriş.';
      return err(Failures.validationError(message));
    }

    const { userId, chatId, destinationName, durationDays, budget, currency } = parsed.data;

    // 2. Build AI prompt for itinerary generation
    const prompt = [
      `${destinationName} için ${durationDays} günlük detaylı seyahat planı oluştur.`,
      budget ? `Bütçe: ${budget} ${currency}.` : '',
      `Her gün için aktiviteler, gezilecek yerler ve kısa açıklamalar ekle.`,
      `RouteWidget formatında yanıt ver, her durağı bir gün olarak göster.`,
    ]
      .filter(Boolean)
      .join(' ');

    // 3. Call Edge Function (if chatId available) or return mock Trip
    if (chatId) {
      const aiResult = await this.aiDataSource.chat({ chatId, userId, content: prompt });

      if (aiResult.isErr()) {
        // Fallback to mock trip on AI error
        return ok(this._buildMockTrip(parsed.data));
      }
    }

    // 4. Build Trip entity from destination name
    return ok(this._buildMockTrip(parsed.data));
  }

  private _buildMockTrip(data: GenerateItineraryInput): Trip {
    return {
      id: crypto.randomUUID(),
      userId: data.userId,
      chatId: data.chatId,
      title: `${data.destinationName} — ${data.durationDays} Günlük Plan`,
      destination: {
        id: crypto.randomUUID(),
        name: data.destinationName,
        country: 'Bilinmiyor',
        tags: [],
      },
      status: 'draft',
      itinerary: Array.from({ length: data.durationDays }, (_, i) => ({
        day: i + 1,
        activities: [`Gün ${i + 1}: ${data.destinationName} keşfi`],
      })),
      estimatedBudget: data.budget,
      currency: data.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
