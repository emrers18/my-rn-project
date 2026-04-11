import { Result } from 'neverthrow';

import { User, UserInsert, UserUpdate } from '../../domain/entities/user';
import { Failure } from '../../domain/failures/failure';
import { IUserRepository } from '../../domain/repositories/i-user-repository';
import { supabaseUserDataSource } from '../datasources/supabase-user-datasource';

export class SupabaseUserRepository implements IUserRepository {
  async getProfile(userId: string): Promise<Result<User, Failure>> {
    return supabaseUserDataSource.getProfile(userId);
  }

  async createProfile(data: UserInsert): Promise<Result<User, Failure>> {
    return supabaseUserDataSource.createProfile(data);
  }

  async updateProfile(userId: string, data: UserUpdate): Promise<Result<User, Failure>> {
    return supabaseUserDataSource.updateProfile(userId, data);
  }
}
