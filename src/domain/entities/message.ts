import { z } from 'zod';

export const MessageRoleSchema = z.enum(['user', 'assistant']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageMetadataSchema = z.object({
  widgetType: z.string().optional(), // DestinationCard' | HotelCard | TicketCard | RouteWidget
  widgetData: z.record(z.string(), z.unknown()).optional(),
  isGenUI: z.boolean().optional().default(false),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  userId: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1),
  metadata: MessageMetadataSchema.default({ isGenUI: false }),
  createdAt: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;
export type MessageInsert = Omit<Message, 'id' | 'createdAt'>;
