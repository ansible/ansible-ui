import { isEncryptedSshPrivateKey } from './isEncryptedSshPrivateKey';

/** Matches the AWX controller validation message for encrypted SSH keys. */
export const SSH_KEY_UNLOCK_REQUIRED_MESSAGE = 'must be set when SSH key is encrypted.';

const SATISFIED_UNLOCK_VALUES = new Set(['ASK', '$encrypted$', 'ENCRYPTED']);

function hasPassphraseValue(sshKeyUnlock: unknown): boolean {
  if (typeof sshKeyUnlock !== 'string') {
    return false;
  }
  const trimmed = sshKeyUnlock.trim();
  if (!trimmed) {
    return false;
  }
  return !SATISFIED_UNLOCK_VALUES.has(trimmed);
}

/**
 * Cross-field validation for Machine credentials: an encrypted SSH private key
 * requires a private key passphrase (unless prompt-on-launch is enabled).
 */
export function validateSshKeyUnlockInput(
  sshKeyUnlock: unknown,
  formValues: Record<string, unknown>
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

  if (hasPassphraseValue(sshKeyUnlock)) {
    return true;
  }

  return SSH_KEY_UNLOCK_REQUIRED_MESSAGE;
}
