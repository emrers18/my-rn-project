import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';

import { Failures, ValidationFailure } from '../failures/failure';

const EmailSchema = z
  .string()
  .min(1, 'E-posta boş olamaz.')
  .email('Geçerli bir e-posta adresi giriniz.');

export type Email = z.infer<typeof EmailSchema> & { readonly __brand: 'Email' };

export function createEmail(raw: string): Result<Email, ValidationFailure> {
  const parsed = EmailSchema.safeParse(raw.trim().toLowerCase());
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Geçersiz e-posta.';
    return err(Failures.validationError(message, 'email'));
  }
  return ok(parsed.data as Email);
}
