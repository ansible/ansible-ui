import { describe, expect, it } from 'vitest';
import {
  SSH_KEY_UNLOCK_REQUIRED_MESSAGE,
  validateSshKeyUnlockInput,
} from './validateSshKeyUnlockInput';

const ENCRYPTED_RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,00000000000000000000000000000000

YWJjZA==
-----END RSA PRIVATE KEY-----`;

describe('validateSshKeyUnlockInput', () => {
  it('requires a passphrase when ssh_key_data is encrypted', () => {
    expect(
      validateSshKeyUnlockInput('', {
        ssh_key_data: ENCRYPTED_RSA_KEY,
      })
    ).toBe(SSH_KEY_UNLOCK_REQUIRED_MESSAGE);
  });

  it('passes when a passphrase is provided', () => {
    expect(
      validateSshKeyUnlockInput('secret-pass', {
        ssh_key_data: ENCRYPTED_RSA_KEY,
      })
    ).toBe(true);
  });

  it('passes when prompt on launch is enabled for the passphrase', () => {
    expect(
      validateSshKeyUnlockInput('', {
        ssh_key_data: ENCRYPTED_RSA_KEY,
        ask_ssh_key_unlock: true,
      })
    ).toBe(true);
  });

  it('skips validation when ssh_key_data is unchanged ($encrypted$)', () => {
    expect(
      validateSshKeyUnlockInput('', {
        ssh_key_data: '$encrypted$',
      })
    ).toBe(true);
  });
});
