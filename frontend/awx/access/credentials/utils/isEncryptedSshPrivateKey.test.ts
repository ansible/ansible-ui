import { describe, expect, it } from 'vitest';
import { isEncryptedSshPrivateKey } from './isEncryptedSshPrivateKey';

const ENCRYPTED_RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,00000000000000000000000000000000

YWJjZA==
-----END RSA PRIVATE KEY-----`;

const UNENCRYPTED_RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7M
-----END RSA PRIVATE KEY-----`;

describe('isEncryptedSshPrivateKey', () => {
  it('returns false for empty or placeholder values', () => {
    expect(isEncryptedSshPrivateKey('')).toBe(false);
    expect(isEncryptedSshPrivateKey('$encrypted$')).toBe(false);
  });

  it('detects traditional encrypted PEM keys', () => {
    expect(isEncryptedSshPrivateKey(ENCRYPTED_RSA_KEY)).toBe(true);
  });

  it('returns false for keys without encryption markers', () => {
    expect(isEncryptedSshPrivateKey(UNENCRYPTED_RSA_KEY)).toBe(false);
  });
});
