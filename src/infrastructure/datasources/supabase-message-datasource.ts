import { supabase } from '@/lib/supabase';
import { err, ok, Result } from 'neverthrow';

import { Message, MessageInsert } from '../../domain/entities/message';
import { Failure, Failures } from '../../domain/failures/failure';

export const MESSAGES_PER_PAGE = 20;

// ─── Row → Entity mapper ───────────────────────
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

// ─── DataSource ────────────────────────────────
export const supabaseMessageDataSource = {
  async send(data: MessageInsert): Promise<Result<Message, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('messages')
        .insert({
          chat_id: data.chatId,
          user_id: data.userId,
          role: data.role,
          content: data.content,
          metadata: data.metadata ?? {},
        } as never)
        .select()
        .single();

      if (error) return err(Failures.serverError(error.message));
      return ok(rowToMessage(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  /**
   * Cursor-based pagination.
   * @param cursor — son görülen mesajın created_at değeri (ilk sayfa için null)
   */
  async getMessages(
    chatId: string,
    cursor: string | null
  ): Promise<Result<{ messages: Message[]; nextCursor: string | null }, Failure>> {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data: rows, error } = await query;
      if (error) return err(Failures.serverError(error.message));

      const messages = (rows ?? []).map(rowToMessage);
      const nextCursor =
        messages.length === MESSAGES_PER_PAGE ? messages[messages.length - 1].createdAt : null;

      return ok({ messages, nextCursor });
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async getById(messageId: string): Promise<Result<Message, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (error) return err(Failures.notFound('Message', error.message));
      return ok(rowToMessage(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },
};
