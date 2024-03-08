import { isRequestError } from '../../../../frontend/common/crud/RequestError';
import {
  ErrorOutput,
  GenericErrorDetail,
  FieldErrorDetail,
} from '../../../../framework/PageForm/typesErrorAdapter';
import { PluginConfiguration } from '../../../interfaces/AuthenticatorPlugin';

export const authenticatorErrorAdapter = (error: unknown): ErrorOutput => {
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error)) {
    const typedBody = error.json as Record<string, unknown[]>;

    const configurationFields = (
      (error as unknown as { configurationSchema: PluginConfiguration[] }).configurationSchema || []
    ).map((field) => field.name);
    for (const key in typedBody) {
      const messages = typedBody[key];

      // Check for non-field errors
      if (key === 'non_field_errors' && Array.isArray(messages)) {
        messages.forEach((message) => {
          if (typeof message === 'string') {
            genericErrors.push({ message });
          }
        });
      } else if (Array.isArray(messages)) {
        const message = messages[0];
        if (typeof message === 'string') {
          const name = configurationFields.includes(key) ? `configuration.${key}` : key;
          fieldErrors.push({ name, message });
        }
      }
    }
  } else if (error instanceof Error) {
    genericErrors.push({ message: error.message });
  }

  return { genericErrors, fieldErrors };
};
