import {
  ErrorAdapter,
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '../../../../framework/PageForm/typesErrorAdapter';
import { isRequestError } from '../../../common/crud/RequestError';

export interface GalaxyError {
  code: string;
  detail: string;
  source: { parameter: string };
  status: string;
  title: string;
}

export const hubErrorAdapter: ErrorAdapter = (
  error,
  mappedKeys?: Record<string, string>
): ErrorOutput => {
  // errors can come in several flavors depending on if the API is from
  // pulp or ansible.
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error) && error.json && typeof error.json === 'object') {
    const data = error.json;

    if ('detail' in data && typeof data['detail'] === 'string') {
      genericErrors.push({ message: data.detail });
      return { genericErrors, fieldErrors };
    }

    if ('non_field_errors' in data && Array.isArray(data['non_field_errors'])) {
      data.non_field_errors.forEach((message) => {
        if (typeof message === 'string') {
          genericErrors.push({ message });
        }
      });
      return { genericErrors, fieldErrors };
    }

    // 500 errors only have err.response.data string
    if (typeof data === 'string') {
      genericErrors.push({ message: data });
      return { genericErrors, fieldErrors };
    }
    if ('errors' in data && Array.isArray(data['errors'])) {
      // Handling Galaxy errors
      for (const e of data.errors as GalaxyError[]) {
        if (e.source && e.source.parameter) {
          if (mappedKeys) {
            const name = mappedKeys[e.source.parameter] ?? e.source.parameter;
            fieldErrors.push({ name, message: e.detail || e.title });
          } else fieldErrors.push({ name: e.source.parameter, message: e.detail || e.title });
        } else {
          genericErrors.push({ message: e.detail || e.title });
        }
      }
    } else {
      // Handling Pulp errors
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
          const parsedMessages = value.map((v) => v as string).join('\n');
          fieldErrors.push({ name: key, message: parsedMessages });
        } else {
          fieldErrors.push({ name: key, message: value as string });
        }
      }
    }
  } else if (error instanceof Error) {
    genericErrors.push({ message: error.message });
  }

  if (fieldErrors.length > 0) {
    fieldErrors.forEach((error) => {
      if (['filename'].includes(error.name)) {
        error.name = 'file';
      }
    });
  }

  return { genericErrors, fieldErrors };
};
export function useHubErrorMessageParser() {
  return (
    error: Error,
    unknownErrorMessage?: string
  ): { message: string; parsedErrors: (GenericErrorDetail | FieldErrorDetail)[] } => {
    const { genericErrors, fieldErrors } = hubErrorAdapter(error);
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
