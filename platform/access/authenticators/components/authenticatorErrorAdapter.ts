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
        let message = messages[0];
        if (typeof message === 'string') {
          // handles basic { FIELD: 'Error message' } structure
          let name = key;
          if (configurationFields.includes(key)) {
            // handles { CONFIGURATION_FIELD: ['Error message'] }
            name = `configuration.${key}`;
          } else if (configurationFields.includes(key.split('.')[0])) {
            // handles { CONFIGURATION_FIELD.object_key: ['Error message'] }
            name = `configuration.${key.split('.')[0]}`;
            message = `${key.split('.')[1]}: ${message}`;
          }

          fieldErrors.push({ name, message: message as string });
        }
      } else if (typeof messages === 'object' && messages !== null) {
        // handles { CONFIGURATION_FIELD: { object_key: 'Error message'} }
        const objectErrors = Object.keys(messages).map(
          (key) => `${key}: ${(messages as { [k: string]: string })[key]}`
        );
        const name = configurationFields.includes(key) ? `configuration.${key}` : key;
        fieldErrors.push({ name, message: objectErrors.join('; ') });
      }
    }
  } else if (error instanceof Error) {
    genericErrors.push({ message: error.message });
  }

  return { genericErrors, fieldErrors };
};
