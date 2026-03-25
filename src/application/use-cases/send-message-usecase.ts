import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';

import { Message, MessageInsert, MessageSchema } from '../../domain/entities/message';
import { Failure, Failures } from '../../domain/failures/failure';
import { IMessageRepository } from '../../domain/repositories/i-message-repository';

const SendMessageInputSchema = z.object({
  chatId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1, 'Mesaj boş olamaz.').max(4000, 'Mesaj çok uzun.'),
});

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

export class SendMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(input: SendMessageInput): Promise<Result<Message, Failure>> {
    const parsed = SendMessageInputSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Geçersiz giriş.';
      return err(Failures.validationError(message));
    }

    const messageInsert: MessageInsert = {
      chatId: parsed.data.chatId,
      userId: parsed.data.userId,
      role: 'user',
      content: parsed.data.content.trim(),
      metadata: { isGenUI: false },
    };

    return this.messageRepository.sendMessage(messageInsert);
  }
}

export function createMockSendMessageUseCase(): SendMessageUseCase {
  const mockRepo: IMessageRepository = {
    sendMessage: async (data: MessageInsert): Promise<Result<Message, Failure>> => {
      const mockMessage = MessageSchema.parse({
        id: crypto.randomUUID(),
        chatId: data.chatId,
        userId: data.userId,
        role: data.role,
        content: data.content,
        metadata: data.metadata,
        createdAt: new Date().toISOString(),
      });
      return ok(mockMessage);
    },
    getMessages: async (): Promise<Result<Message[], Failure>> => ok([]),
    getMessageById: async (): Promise<Result<Message, Failure>> =>
      err(Failures.notFound('Message')),
  };
  return new SendMessageUseCase(mockRepo);
}
