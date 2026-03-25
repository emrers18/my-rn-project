import { Result } from 'neverthrow';

import { ChatSession, ChatSessionInsert, ChatSessionUpdate } from '../entities/chat-session';
import { Failure } from '../failures/failure';

// SupabaseChatRepository bu interface'i implement edecek
export interface IChatRepository {
  /** Yeni bir chat oturumu oluşturur. */
  createChat(data: ChatSessionInsert): Promise<Result<ChatSession, Failure>>;

  /** Kullanıcıya ait tüm chat oturumlarını getirir (en yeni önce). */
  getChatHistory(userId: string): Promise<Result<ChatSession[], Failure>>;

  /** Belirli bir chat oturumunu getirir. */
  getChatById(chatId: string): Promise<Result<ChatSession, Failure>>;

  /** Chat başlığını günceller. */
  updateChat(chatId: string, data: ChatSessionUpdate): Promise<Result<ChatSession, Failure>>;

  /** Chat oturumunu ve tüm mesajlarını siler. */
  deleteChat(chatId: string): Promise<Result<void, Failure>>;
}
