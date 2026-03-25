import { z } from 'zod';

export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).default('Yeni Sohbet'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatSessionInsert = Pick<ChatSession, 'userId'> & Partial<Pick<ChatSession, 'title'>>;
export type ChatSessionUpdate = Partial<Pick<ChatSession, 'title' | 'updatedAt'>>;
