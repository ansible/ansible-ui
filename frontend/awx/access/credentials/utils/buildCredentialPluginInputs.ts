import { CredentialInputField } from '../../../interfaces/CredentialType';

type CredentialFormValues = Record<string, string | number | { name: string } | undefined | null>;

export type CredentialPluginInputValue = string | number | { name: string };

/**
 * Moves credential type input fields from the top-level form object into
 * `inputs`. Empty strings are omitted so optional secrets (such as an unset
 * `ssh_key_unlock`) are not sent explicitly on PATCH, matching create behavior
 * and AWX validation expectations.
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

    if (value === undefined || value === null || value === '') {
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
