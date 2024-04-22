import {
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '../../../../framework/PageForm/typesErrorAdapter';
import { isRequestError } from '../../../common/crud/RequestError';

export const awxErrorAdapter = (error: unknown): ErrorOutput => {
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error) && typeof error.json === 'object' && error.json !== null) {
    const data = error.json;
    if ('__all__' in data) {
      if (Array.isArray(data['__all__'])) {
        genericErrors.push({ message: data['__all__'][0] as string });
      } else {
        genericErrors.push({ message: data['__all__'] as string });
      }
    } else if ('inputs' in data) {
      // handle credential inputs errors
      const inputs = data['inputs'];
      if (Array.isArray(inputs)) {
        inputs.forEach((input) => {
          if (typeof input === 'string') {
            genericErrors.push({ message: input });
          }
        });
      } else if (typeof inputs === 'object' && inputs !== null) {
        Object.entries(inputs).forEach(([key, value]) => {
          if (typeof value === 'string') {
            fieldErrors.push({ name: key, message: value });
          } else if (Array.isArray(value) && value.length > 0) {
            fieldErrors.push({ name: key, message: value[0] as string });
          }
        });
      }
    }

    // handle API responses {error: 'Cannot assign a Credential of kind `galaxy`.'}
    else if ('error' in data) {
      if (Array.isArray(data['error'])) {
        genericErrors.push({ message: data['error'][0] as string });
      } else {
        genericErrors.push({ message: data['error'] as string });
      }
    } else {
      for (const key in data) {
        let value = (data as Record<string, unknown>)[key];
        if (typeof value === 'string') {
          fieldErrors.push({ name: key, message: value });
        } else if (Array.isArray(value)) {
          value = value[0];
          // Convert any value type to string
          fieldErrors.push({ name: key, message: String(value) });
        }
      }
    }
  } else if (error instanceof Error) {
    genericErrors.push({ message: error.message });
  }
  return { genericErrors, fieldErrors };
};

/**
 * Parses the error message and returns a formatted message along with parsed errors.
 * @param {Error} error - The error object to parse.
 * @param {string} [unknownErrorMessage] - Optional. The translated string for unknown errors.
 * @returns {{ message: string; parsedErrors: (GenericErrorDetail | FieldErrorDetail)[] }} An object containing the formatted error message and parsed errors.
 */
export function useAwxErrorMessageParser() {
  return (
    error: Error,
    unknownErrorMessage?: string
  ): { message: string; parsedErrors: (GenericErrorDetail | FieldErrorDetail)[] } => {
    const { genericErrors, fieldErrors } = awxErrorAdapter(error);
    const parsedErrors = [
      ...genericErrors,
      ...fieldErrors.filter((e) => e.message).map(({ message }) => ({ message })),
    ];
    const message =
      typeof parsedErrors[0]?.message === 'string' && parsedErrors.length === 1
        ? parsedErrors[0].message
        : unknownErrorMessage
          ? unknownErrorMessage
          : `Unknown error`;
    return { message, parsedErrors };
  };
}
