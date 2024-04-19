import {
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '../../../framework/PageForm/typesErrorAdapter';
import { isRequestError } from '../../common/crud/RequestError';

export const edaErrorAdapter = (error: unknown): ErrorOutput => {
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error) && error.json && typeof error.json === 'object') {
    const data = error.json;
    for (const key in data) {
      const value = (data as Record<string, unknown>)[key];
      // Check for non-field errors
      if (key === 'non_field_errors' && Array.isArray(value)) {
        value.forEach((message) => {
          if (typeof message === 'string') {
            genericErrors.push({ message });
          }
        });
      } else if (Array.isArray(value)) {
        const message = value.join(',');
        fieldErrors.push({ name: key, message });
      } else {
        const message = String(value);
        fieldErrors.push({ name: key, message });
      }
    }
  } else if (error instanceof Error) {
    genericErrors.push({ message: error.message });
  }

  return { genericErrors, fieldErrors };
};

export function useEdaErrorMessageParser() {
  return (
    error: Error,
    unknownErrorMessage?: string
  ): { message: string; parsedErrors: (GenericErrorDetail | FieldErrorDetail)[] } => {
    const { genericErrors, fieldErrors } = edaErrorAdapter(error);
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
