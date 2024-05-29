import { ErrorOutput, FieldErrorDetail, GenericErrorDetail } from './typesErrorAdapter';

export const genericErrorAdapter = (error: unknown): ErrorOutput => {
  const errorDetailKeys: string[] = ['json'];
  const genericErrorKeys: string[] = ['non_field_errors'];

  const genericErrors: GenericErrorDetail[] = [];
  const fieldErrors: FieldErrorDetail[] = [];

  switch (typeof error) {
    case 'string':
      genericErrors.push({ message: error });
      break;
    case 'object':
      if (error === null) break;

      if (Array.isArray(error)) {
        for (const value of error) {
          if (typeof value === 'string') {
            genericErrors.push({ message: value });
          }
        }
        break;
      }

      for (const errorDetailsKey of errorDetailKeys) {
        if (
          errorDetailsKey in error &&
          typeof (error as Record<string, unknown>)[errorDetailsKey] === 'object' &&
          (error as Record<string, unknown>)[errorDetailsKey] !== null
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const name in (error as Record<string, any>)[errorDetailsKey]) {
            const value = (
              (error as Record<string, unknown>)[errorDetailsKey] as Record<string, unknown>
            )[name];
            if (genericErrorKeys.includes(name)) {
              if (typeof value === 'string') {
                genericErrors.push({ message: value });
              } else if (Array.isArray(value)) {
                for (const message of value) {
                  if (typeof message === 'string') {
                    genericErrors.push({ message });
                  }
                }
              }
            } else {
              if (typeof value === 'string') {
                fieldErrors.push({ name, message: value });
              } else if (Array.isArray(value)) {
                for (const message of value) {
                  if (typeof message === 'string') {
                    fieldErrors.push({ name, message });
                  }
                }
              }
            }
          }
        } else if (error instanceof Error) {
          genericErrors.push({ message: error.message });
        }
      }
      break;
  }

  return { genericErrors, fieldErrors };
};
