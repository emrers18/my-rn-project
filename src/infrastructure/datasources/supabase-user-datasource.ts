import { supabase } from '@/lib/supabase';
import { err, ok, Result } from 'neverthrow';

import { User, UserInsert, UserUpdate } from '../../domain/entities/user';
import { Failure, Failures } from '../../domain/failures/failure';

// ─── Row → Entity mapper ───────────────────────
function rowToUser(row: {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── DataSource ────────────────────────────────
export const supabaseUserDataSource = {
  async getProfile(userId: string): Promise<Result<User, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return err(Failures.notFound('Profile', error.message));
      return ok(rowToUser(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async createProfile(data: UserInsert): Promise<Result<User, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('profiles')
        .insert({
          id: data.id,
          email: data.email,
          full_name: data.fullName ?? null,
          avatar_url: data.avatarUrl ?? null,
        } as never)
        .select()
        .single();

      if (error) return err(Failures.serverError(error.message));
      return ok(rowToUser(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },

  async updateProfile(userId: string, data: UserUpdate): Promise<Result<User, Failure>> {
    try {
      const { data: row, error } = await supabase
        .from('profiles')
        .update({
          ...(data.fullName !== undefined && { full_name: data.fullName }),
          ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', userId)
        .select()
        .single();

      if (error) return err(Failures.serverError(error.message));
      return ok(rowToUser(row));
    } catch (e) {
      return err(Failures.unknown(e));
    }
  },
};
