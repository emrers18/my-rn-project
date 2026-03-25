import { Result } from 'neverthrow';

import { User, UserInsert, UserUpdate } from '../entities/user';
import { Failure } from '../failures/failure';

export interface IUserRepository {
  getProfile(userId: string): Promise<Result<User, Failure>>;

  createProfile(data: UserInsert): Promise<Result<User, Failure>>;

  updateProfile(userId: string, data: UserUpdate): Promise<Result<User, Failure>>;
}
