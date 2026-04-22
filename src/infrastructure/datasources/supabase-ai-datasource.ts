import { supabase } from '@/lib/supabase';
import { err, ok, Result } from 'neverthrow';

import { Message } from '../../domain/entities/message';
import { Failure, Failures } from '../../domain/failures/failure';

// ─── Row → Entity mapper ──────────────────────────────────────────────────────
function rowToMessage(row: {
  id: string;
  chat_id: string;
  user_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}): Message {
  return {
    id: row.id,
    chatId: row.chat_id,
    userId: row.user_id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    metadata: {
      isGenUI: false,
      ...((row.metadata as Record<string, unknown>) ?? {}),
    },
    createdAt: row.created_at,
  };
}

// ─── Input / Output types ─────────────────────────────────────────────────────
interface AiChatInput {
  chatId: string;
  userId: string;
  content: string;
}

export interface AiChatResult {
  userMessage: Message;
  aiMessage: Message;
}

// ─── DataSource ───────────────────────────────────────────────────────────────
export const supabaseAiDataSource = {
  /**
   * Calls the `gemini-chat` Edge Function which:
   * 1. Saves the user message to the DB
   * 2. Fetches chat history
   * 3. Calls Gemini 2.5 Flash
   * 4. Saves the AI response (with GenUI metadata if applicable) to the DB
   * 5. Returns both messages
   */
  async chat(input: AiChatInput): Promise<Result<AiChatResult, Failure>> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.warn('AI Chat: No active session found.');
      }

      const { data, error } = await supabase.functions.invoke<{
        userMessage: {
          id: string;
          chat_id: string;
          user_id: string;
          role: string;
          content: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        aiMessage: {
          id: string;
          chat_id: string;
          user_id: string;
          role: string;
          content: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
      }>('gemini-chat', {
        body: input,
      });

      if (error) {
        console.error('Edge Function Error:', error);
        return err(Failures.serverError(`Edge Function hatası: ${error.message}`));
      }
      if (!data?.userMessage || !data?.aiMessage) {
        return err(Failures.serverError('Geçersiz yanıt formatı.'));
      }

      return ok({
        userMessage: rowToMessage(data.userMessage),
        aiMessage: rowToMessage(data.aiMessage),
      });
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },
};
