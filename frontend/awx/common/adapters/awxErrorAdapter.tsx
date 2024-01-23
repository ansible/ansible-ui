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
