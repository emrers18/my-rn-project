import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';

import { Failures, ValidationFailure } from '../failures/failure';

const PasswordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır.')
  .max(128, 'Şifre çok uzun.')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.');

export type Password = string & { readonly __brand: 'Password' };

export function createPassword(raw: string): Result<Password, ValidationFailure> {
  const parsed = PasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Geçersiz şifre.';
    return err(Failures.validationError(message, 'password'));
  }
  return ok(parsed.data as Password);
}
