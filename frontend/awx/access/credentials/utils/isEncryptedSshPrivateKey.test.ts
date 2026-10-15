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

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function buildOpenSshPrivateKeyPem(payload: Uint8Array): string {
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${toBase64(payload)}\n-----END OPENSSH PRIVATE KEY-----`;
}

const OPENSSH_UNENCRYPTED_PREFIX = new Uint8Array([
  ...new TextEncoder().encode('openssh-key-v1'),
  0,
  0,
  0,
  0,
  4,
  ...new TextEncoder().encode('none'),
]);

const OPENSSH_ENCRYPTED_PREFIX = new Uint8Array([
  ...new TextEncoder().encode('openssh-key-v1'),
  0,
  0,
  0,
  0,
  7,
  ...new TextEncoder().encode('bcrypt'),
]);

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

  it('detects OpenSSH keys with a non-none cipher', () => {
    expect(isEncryptedSshPrivateKey(buildOpenSshPrivateKeyPem(OPENSSH_ENCRYPTED_PREFIX))).toBe(
      true
    );
  });

  it('returns false for OpenSSH keys with cipher none', () => {
    expect(isEncryptedSshPrivateKey(buildOpenSshPrivateKeyPem(OPENSSH_UNENCRYPTED_PREFIX))).toBe(
      false
    );
  });

  it('detects PKCS#8 ENCRYPTED PRIVATE KEY headers', () => {
    const pkcs8 = `-----BEGIN ENCRYPTED PRIVATE KEY-----
YWJjZA==
-----END ENCRYPTED PRIVATE KEY-----`;
    expect(isEncryptedSshPrivateKey(pkcs8)).toBe(true);
  });
});
