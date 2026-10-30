import { CredentialInputField } from '../../../interfaces/CredentialType';

type CredentialFormValues = Record<string, string | number | { name: string } | undefined | null>;

export type CredentialPluginInputValue = string | number | { name: string };

/**
 * Optional secret fields that must be omitted from `inputs` when empty so PATCH
 * does not send `""` and trigger AWX validation (e.g. `ssh_key_unlock`).
 */
const CREDENTIAL_INPUT_FIELDS_OMIT_WHEN_EMPTY = new Set(['ssh_key_unlock']);

function shouldOmitEmptyCredentialInput(fieldId: string): boolean {
  return CREDENTIAL_INPUT_FIELDS_OMIT_WHEN_EMPTY.has(fieldId);
}

/**
 * Moves credential type input fields from the top-level form object into
 * `inputs`.
 */
export function buildCredentialPluginInputs(
  credential: CredentialFormValues,
  possibleFields: CredentialInputField[],
  isHandledByCredentialPlugin: (field: string) => boolean
): Record<string, CredentialPluginInputValue> {
  const pluginInputs: Record<string, CredentialPluginInputValue> = {};

  possibleFields.forEach((field) => {
    if (!field.id || typeof field.id !== 'string') {
      return;
    }
    if (!(field.id in credential) || isHandledByCredentialPlugin(field.id)) {
      return;
    }

    const value = credential[field.id];
    delete credential[field.id];

    if (value === undefined || value === null) {
      return;
    }
    if (value === '' && shouldOmitEmptyCredentialInput(field.id)) {
      return;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      pluginInputs[field.id] = value;
      return;
    }
    if (typeof value === 'object' && value !== null && 'name' in value) {
      pluginInputs[field.id] = value;
    }
  });

  return pluginInputs;
}
