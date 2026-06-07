jest.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      createBucket: jest.fn().mockResolvedValue({}),
      from: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue({ data: [] }),
        remove: jest.fn().mockResolvedValue({}),
        upload: jest.fn().mockResolvedValue({}),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
      }),
    },
  },
}));

import { decodeBase64ToArrayBuffer } from '../../../lib/storage';

describe('decodeBase64ToArrayBuffer', () => {
  it('decodes simple base64 string to ArrayBuffer', () => {
    // "Hello" in base64: SGVsbG8=
    const base64 = 'SGVsbG8=';
    const buffer = decodeBase64ToArrayBuffer(base64);
    const view = new Uint8Array(buffer);

    expect(view.length).toBe(5);
    expect(String.fromCharCode(...view)).toBe('Hello');
  });

  it('decodes base64 with data URI prefix', () => {
    // "Hello" in base64 with image prefix: data:image/jpeg;base64,SGVsbG8=
    const dataUri = 'data:image/jpeg;base64,SGVsbG8=';
    const buffer = decodeBase64ToArrayBuffer(dataUri);
    const view = new Uint8Array(buffer);

    expect(view.length).toBe(5);
    expect(String.fromCharCode(...view)).toBe('Hello');
  });

  it('decodes longer base64 string correctly', () => {
    // "React Native & Supabase" in base64: UmVhY3QgTmF0aXZlICYgU3VwYWJhc2U=
    const base64 = 'UmVhY3QgTmF0aXZlICYgU3VwYWJhc2U=';
    const buffer = decodeBase64ToArrayBuffer(base64);
    const view = new Uint8Array(buffer);

    expect(view.length).toBe(23);
    expect(String.fromCharCode(...view)).toBe('React Native & Supabase');
  });

  it('handles base64 with newlines and whitespace', () => {
    const base64 = 'UmVhY3Qg\nTmF0aXZl\r\nICYgU3VwYWJhc2U=';
    const buffer = decodeBase64ToArrayBuffer(base64);
    const view = new Uint8Array(buffer);

    expect(view.length).toBe(23);
    expect(String.fromCharCode(...view)).toBe('React Native & Supabase');
  });
});
