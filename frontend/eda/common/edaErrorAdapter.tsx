import {
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '@ansible/ansible-ui-framework/PageForm/typesErrorAdapter';
import { isRequestError } from '@ansible/common-ui/crud/RequestError';

/**
 * Maps API validation payloads to react-hook-form field paths (e.g. inputs.aws_access_key).
 * Nested objects are flattened with dot notation; leaf values are strings or string arrays.
 */
function appendFieldErrors(
  fieldName: string,
  value: unknown,
  fieldErrors: FieldErrorDetail[],
  genericErrors: GenericErrorDetail[]
): void {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    fieldErrors.push({ name: fieldName, message: value });
    return;
  }
  if (Array.isArray(value)) {
    const messages = value.map((item) => String(item));
    if (messages.length === 0) {
      return;
    }
    // Errors on the whole `inputs` object (not a specific input field) are non-field errors.
    if (fieldName === 'inputs') {
      messages.forEach((message) => genericErrors.push({ message }));
      return;
    }
    fieldErrors.push({ name: fieldName, message: messages.join(',') });
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      appendFieldErrors(fieldName ? `${fieldName}.${key}` : key, child, fieldErrors, genericErrors);
    }
    return;
  }
  fieldErrors.push({ name: fieldName, message: String(value) });
}

export const edaErrorAdapter = (error: unknown): ErrorOutput => {
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error) && error.json && typeof error.json === 'object') {
    const data = error.json;
    for (const key in data) {
      const value = (data as Record<string, unknown>)[key];
      if (key === 'detail') {
        if (Array.isArray(value)) {
          genericErrors.push({ message: value[0] as string });
        } else {
          genericErrors.push({ message: value as string });
        }
      } else if (key === 'non_field_errors' && Array.isArray(value)) {
        value.forEach((message) => {
          if (typeof message === 'string') {
            genericErrors.push({ message });
          }
        });
      } else {
        appendFieldErrors(key, value, fieldErrors, genericErrors);
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
