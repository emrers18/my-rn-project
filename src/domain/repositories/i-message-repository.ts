import { Result } from 'neverthrow';

import { Message, MessageInsert } from '../entities/message';
import { Failure } from '../failures/failure';

export const MESSAGES_PER_PAGE = 20;

export interface IMessageRepository {
  sendMessage(data: MessageInsert): Promise<Result<Message, Failure>>;

  getMessages(chatId: string, page: number): Promise<Result<Message[], Failure>>;

  getMessageById(messageId: string): Promise<Result<Message, Failure>>;
}
