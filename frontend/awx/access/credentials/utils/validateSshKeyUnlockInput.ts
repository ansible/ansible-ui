import { SSH_KEY_UNLOCK_REQUIRED_I18N_KEY } from './credentialSshKeyValidation';
import { isEncryptedSshPrivateKey } from './isEncryptedSshPrivateKey';

/** @deprecated Use {@link SSH_KEY_UNLOCK_REQUIRED_I18N_KEY} with `t()` — kept for unit tests. */
export const SSH_KEY_UNLOCK_REQUIRED_MESSAGE = SSH_KEY_UNLOCK_REQUIRED_I18N_KEY;

const SATISFIED_UNLOCK_VALUES = new Set(['ASK', '$encrypted$']);

export type ValidateSshKeyUnlockOptions = Readonly<{
  /** Localized placeholder shown for unchanged encrypted secrets (`t('ENCRYPTED')`). */
  maskedSecretPlaceholder: string;
  /** Localized validation message (`t(SSH_KEY_UNLOCK_REQUIRED_I18N_KEY)`). */
  requiredMessage: string;
}>;

function hasPassphraseValue(sshKeyUnlock: unknown, options: Readonly<ValidateSshKeyUnlockOptions>): boolean {
  if (typeof sshKeyUnlock !== 'string') {
    return false;
  }
  const trimmed = sshKeyUnlock.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed === options.maskedSecretPlaceholder) {
    return false;
  }
  return !SATISFIED_UNLOCK_VALUES.has(trimmed);
}

/**
 * Cross-field validation for Machine / SCM credentials: an encrypted SSH private key
 * requires a private key passphrase (unless prompt-on-launch is enabled).
 */
export function validateSshKeyUnlockInput(
  sshKeyUnlock: unknown,
  formValues: Record<string, unknown>,
  options: Readonly<ValidateSshKeyUnlockOptions>
): true | string {
  if (formValues.ask_ssh_key_unlock === true) {
    return true;
  }

  const sshKeyData = formValues.ssh_key_data;
  if (typeof sshKeyData !== 'string' || !sshKeyData || sshKeyData === '$encrypted$') {
    return true;
  }
  if (formValues.ask_ssh_key_data === true || sshKeyData === 'ASK') {
    return true;
  }

  if (!isEncryptedSshPrivateKey(sshKeyData)) {
    return true;
  }

  if (hasPassphraseValue(sshKeyUnlock, options)) {
    return true;
  }

  return options.requiredMessage;
}

export function createSshKeyUnlockValidationOptions(
  t: (key: string) => string
): ValidateSshKeyUnlockOptions {
  return {
    maskedSecretPlaceholder: t('ENCRYPTED'),
    requiredMessage: t(SSH_KEY_UNLOCK_REQUIRED_I18N_KEY),
  };
}
