import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
export type UserInsert = Pick<User, 'id' | 'email'> & Partial<Pick<User, 'fullName' | 'avatarUrl'>>;
export type UserUpdate = Partial<Pick<User, 'fullName' | 'avatarUrl'>>;
