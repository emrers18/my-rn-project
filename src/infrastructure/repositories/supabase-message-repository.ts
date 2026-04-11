import { err, ok, Result } from 'neverthrow';

import { Message, MessageInsert } from '../../domain/entities/message';
import { Failure } from '../../domain/failures/failure';
import { IMessageRepository } from '../../domain/repositories/i-message-repository';
import { supabaseMessageDataSource } from '../datasources/supabase-message-datasource';

export class SupabaseMessageRepository implements IMessageRepository {
  async sendMessage(data: MessageInsert): Promise<Result<Message, Failure>> {
    return supabaseMessageDataSource.send(data);
  }

  async getMessages(chatId: string, _page: number): Promise<Result<Message[], Failure>> {
    const result = await supabaseMessageDataSource.getMessages(chatId, null);
    if (result.isErr()) return err(result.error);
    return ok(result.value.messages);
  }

  async getMessageById(messageId: string): Promise<Result<Message, Failure>> {
    return supabaseMessageDataSource.getById(messageId);
  }
}
