import { supabase } from '@/lib/supabase';
import { err, ok, Result } from 'neverthrow';

import {
  ChatSession,
  ChatSessionInsert,
  ChatSessionUpdate,
} from '../../domain/entities/chat-session';
import { Failure, Failures } from '../../domain/failures/failure';

// ─── Row → Entity mapper ───────────────────────
function rowToChatSession(row: {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── DataSource ────────────────────────────────
export const supabaseChatDataSource = {
  async create(data: ChatSessionInsert): Promise<Result<ChatSession, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('chats')
        .insert({ user_id: data.userId, title: data.title ?? 'Yeni Sohbet' } as never)
        .select()
        .single();

      if (error) return err(Failures.serverError(error.message));
      return ok(rowToChatSession(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async getHistory(userId: string): Promise<Result<ChatSession[], Failure>> {
    try {
      const { data: rows, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) return err(Failures.serverError(error.message));
      return ok((rows ?? []).map(rowToChatSession));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async getById(chatId: string): Promise<Result<ChatSession, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) return err(Failures.notFound('Chat', error.message));
      return ok(rowToChatSession(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async update(chatId: string, data: ChatSessionUpdate): Promise<Result<ChatSession, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('chats')
        .update({
          ...(data.title && { title: data.title }),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', chatId)
        .select()
        .single();

      if (error) return err(Failures.serverError(error.message));
      return ok(rowToChatSession(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async delete(chatId: string): Promise<Result<void, Failure>> {
    try {
      const { error } = await supabase.from('chats').delete().eq('id', chatId);
      if (error) return err(Failures.serverError(error.message));
      return ok(undefined);
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },
};
