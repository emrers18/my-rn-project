export type AuthFailure =
  | { readonly _tag: 'InvalidCredentials'; message: string }
  | { readonly _tag: 'UserNotFound'; message: string }
  | { readonly _tag: 'EmailAlreadyInUse'; message: string }
  | { readonly _tag: 'SessionExpired'; message: string };

export type NetworkFailure =
  | { readonly _tag: 'NoConnection'; message: string }
  | { readonly _tag: 'RequestTimeout'; message: string }
  | { readonly _tag: 'ServerError'; message: string; statusCode?: number };

export type ValidationFailure = {
  readonly _tag: 'ValidationError';
  message: string;
  field?: string;
};

export type NotFoundFailure = {
  readonly _tag: 'NotFound';
  message: string;
  resource: string;
};

export type UnknownFailure = {
  readonly _tag: 'Unknown';
  message: string;
  originalError?: unknown;
};

export type Failure =
  | AuthFailure
  | NetworkFailure
  | ValidationFailure
  | NotFoundFailure
  | UnknownFailure;

export const Failures = {
  invalidCredentials: (message = 'Geçersiz e-posta veya şifre.'): AuthFailure => ({
    _tag: 'InvalidCredentials',
    message,
  }),
  userNotFound: (message = 'Kullanıcı bulunamadı.'): AuthFailure => ({
    _tag: 'UserNotFound',
    message,
  }),
  emailAlreadyInUse: (message = 'Bu e-posta zaten kullanımda.'): AuthFailure => ({
    _tag: 'EmailAlreadyInUse',
    message,
  }),
  sessionExpired: (message = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.'): AuthFailure => ({
    _tag: 'SessionExpired',
    message,
  }),
  noConnection: (message = 'İnternet bağlantısı yok.'): NetworkFailure => ({
    _tag: 'NoConnection',
    message,
  }),
  requestTimeout: (message = 'İstek zaman aşımına uğradı.'): NetworkFailure => ({
    _tag: 'RequestTimeout',
    message,
  }),
  serverError: (message = 'Sunucu hatası.', statusCode?: number): NetworkFailure => ({
    _tag: 'ServerError',
    message,
    statusCode,
  }),
  validationError: (message: string, field?: string): ValidationFailure => ({
    _tag: 'ValidationError',
    message,
    field,
  }),
  notFound: (resource: string, message = `${resource} bulunamadı.`): NotFoundFailure => ({
    _tag: 'NotFound',
    message,
    resource,
  }),
  unknown: (originalError?: unknown): UnknownFailure => ({
    _tag: 'Unknown',
    message: 'Beklenmeyen bir hata oluştu.',
    originalError,
  }),
} as const;
