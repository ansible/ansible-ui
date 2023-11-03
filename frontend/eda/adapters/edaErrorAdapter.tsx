import {
  ErrorOutput,
  FieldErrorDetail,
  GenericErrorDetail,
} from '../../../framework/PageForm/typesErrorAdapter';
import { isRequestError } from '../../common/crud/RequestError';

export const edaErrorAdapter = (error: unknown): ErrorOutput => {
  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  if (isRequestError(error) && typeof error.json === 'object' && error.json !== null) {
    const data = error.json;
    if ('errors' in data) {
      if (Array.isArray(data['errors'])) {
        genericErrors.push({ message: data['errors'][0] as string });
      } else {
        genericErrors.push({ message: data['errors'] as string });
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
