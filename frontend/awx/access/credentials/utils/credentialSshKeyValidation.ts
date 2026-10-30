import { CredentialType } from '../../../interfaces/CredentialType';

/** Credential kinds whose type detail schema includes SSH key + unlock fields. */
const CREDENTIAL_KINDS_WITH_SSH_KEY_UNLOCK_VALIDATION: ReadonlySet<CredentialType['kind']> =
  new Set(['ssh', 'scm']);

export function credentialKindUsesSshKeyUnlockValidation(
  kind: CredentialType['kind'] | undefined
): boolean {
  return kind !== undefined && CREDENTIAL_KINDS_WITH_SSH_KEY_UNLOCK_VALIDATION.has(kind);
}

/** i18n key matching the AWX controller validation message for encrypted SSH keys. */
export const SSH_KEY_UNLOCK_REQUIRED_I18N_KEY = 'must be set when SSH key is encrypted.';
