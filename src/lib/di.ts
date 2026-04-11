import { GenerateItineraryUseCase } from '../application/use-cases/generate-itinerary-usecase';
import { GetChatHistoryUseCase } from '../application/use-cases/get-chat-history-usecase';
import { SendMessageUseCase } from '../application/use-cases/send-message-usecase';
import { SupabaseChatRepository } from '../infrastructure/repositories/supabase-chat-repository';
import { SupabaseMessageRepository } from '../infrastructure/repositories/supabase-message-repository';
import { SupabaseUserRepository } from '../infrastructure/repositories/supabase-user-repository';

// ─── Repository singletons ────────────────────
const chatRepository = new SupabaseChatRepository();
const messageRepository = new SupabaseMessageRepository();
const userRepository = new SupabaseUserRepository();

// ─── Use case singletons ──────────────────────
const sendMessageUseCase = new SendMessageUseCase(messageRepository);
const getChatHistoryUseCase = new GetChatHistoryUseCase(chatRepository);
const generateItineraryUseCase = new GenerateItineraryUseCase();

export function getDependencies() {
  return {
    chatRepository,
    messageRepository,
    userRepository,

    sendMessageUseCase,
    getChatHistoryUseCase,
    generateItineraryUseCase,
  } as const;
}
