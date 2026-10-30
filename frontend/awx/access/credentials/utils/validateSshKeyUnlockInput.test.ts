import { describe, expect, it } from 'vitest';
import {
  SSH_KEY_UNLOCK_REQUIRED_MESSAGE,
  createSshKeyUnlockValidationOptions,
  validateSshKeyUnlockInput,
} from './validateSshKeyUnlockInput';

const ENCRYPTED_RSA_KEY = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,00000000000000000000000000000000

YWJjZA==
-----END RSA PRIVATE KEY-----`;

const validationOptions = createSshKeyUnlockValidationOptions((key) => key);

describe('validateSshKeyUnlockInput', () => {
  it('requires a passphrase when ssh_key_data is encrypted', () => {
    expect(
      validateSshKeyUnlockInput(
        '',
        {
          ssh_key_data: ENCRYPTED_RSA_KEY,
        },
        validationOptions
      )
    ).toBe(SSH_KEY_UNLOCK_REQUIRED_MESSAGE);
  });

  it('passes when a passphrase is provided', () => {
    expect(
      validateSshKeyUnlockInput(
        'secret-pass',
        {
          ssh_key_data: ENCRYPTED_RSA_KEY,
        },
        validationOptions
      )
    ).toBe(true);
  });

  it('passes when prompt on launch is enabled for the passphrase', () => {
    expect(
      validateSshKeyUnlockInput(
        '',
        {
          ssh_key_data: ENCRYPTED_RSA_KEY,
          ask_ssh_key_unlock: true,
        },
        validationOptions
      )
    ).toBe(true);
  });

  it('skips validation when ssh_key_data is unchanged ($encrypted$)', () => {
    expect(
      validateSshKeyUnlockInput(
        '',
        {
          ssh_key_data: '$encrypted$',
        },
        validationOptions
      )
    ).toBe(true);
  });

  it('does not treat the masked ENCRYPTED placeholder as a passphrase when the key changed', () => {
    expect(
      validateSshKeyUnlockInput(
        'ENCRYPTED',
        {
          ssh_key_data: ENCRYPTED_RSA_KEY,
        },
        validationOptions
      )
    ).toBe(SSH_KEY_UNLOCK_REQUIRED_MESSAGE);
  });

  it('does not mistake a localized masked placeholder for a user passphrase', () => {
    const localizedOptions = createSshKeyUnlockValidationOptions((key) =>
      key === 'ENCRYPTED' ? 'CHIFFRÉ' : key
    );
    expect(
      validateSshKeyUnlockInput(
        'CHIFFRÉ',
        {
          ssh_key_data: ENCRYPTED_RSA_KEY,
        },
        localizedOptions
      )
    ).toBe(SSH_KEY_UNLOCK_REQUIRED_MESSAGE);
  });
});
