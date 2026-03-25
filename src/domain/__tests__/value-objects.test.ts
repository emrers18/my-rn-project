import { createEmail } from '../../domain/value-objects/email';
import { createPassword } from '../../domain/value-objects/password';

describe('Email Value Object', () => {
  it('geçerli email için ok döner', () => {
    const result = createEmail('test@example.com');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe('test@example.com');
    }
  });

  it('büyük harf emaili normalize eder', () => {
    const result = createEmail('TEST@EXAMPLE.COM');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe('test@example.com');
    }
  });

  it('geçersiz email için err döner', () => {
    const result = createEmail('gecersiz-email');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error._tag).toBe('ValidationError');
      expect(result.error.field).toBe('email');
    }
  });

  it('boş string için err döner', () => {
    const result = createEmail('');
    expect(result.isErr()).toBe(true);
  });

  it('@-siz email için err döner', () => {
    const result = createEmail('kullanici.example.com');
    expect(result.isErr()).toBe(true);
  });
});

describe('Password Value Object', () => {
  it('geçerli şifre için ok döner', () => {
    const result = createPassword('Test1234');
    expect(result.isOk()).toBe(true);
  });

  it('7 karakterli şifre için err döner', () => {
    const result = createPassword('Abc1234');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error._tag).toBe('ValidationError');
    }
  });

  it('büyük harf içermeyen şifre için err döner', () => {
    const result = createPassword('test1234');
    expect(result.isErr()).toBe(true);
  });

  it('rakam içermeyen şifre için err döner', () => {
    const result = createPassword('TestTest');
    expect(result.isErr()).toBe(true);
  });
});
