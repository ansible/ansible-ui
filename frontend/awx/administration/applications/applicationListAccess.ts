import { PageAsyncQueryErrorText } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { isRequestError } from '@ansible/common-ui/crud/RequestError';
import { TFunction } from 'i18next';

export function oauthApplicationListForbiddenMessage(t: TFunction) {
  return t(
    'You do not have permission to view OAuth applications. Please contact your system administrator if there is an issue with your access.'
  );
}

export function awxApplicationListForbiddenMessage(t: TFunction) {
  return t(
    'You do not have permission to view applications. Please contact your system administrator if there is an issue with your access.'
  );
}

export function createApplicationListQueryErrorText(
  t: TFunction,
  forbiddenMessage: string
): PageAsyncQueryErrorText {
  return (error: Error) =>
    isRequestError(error) && error.statusCode === 403
      ? forbiddenMessage
      : t('Error loading applications');
}

export function isApplicationListForbidden(error: unknown): boolean {
  return isRequestError(error) && error.statusCode === 403;
}
