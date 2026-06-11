import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useEdaErrorMessageParser } from '../../../common/edaErrorAdapter';

export function useCopyCredential(onComplete?: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();
  const parseError = useEdaErrorMessageParser();

  return (credential: EdaCredential) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${credential.name} duplicated.`),
      timeout: 2000,
    };
    postRequest(edaAPI`/eda-credentials/${credential.id.toString()}/copy/`, {
      name: `${credential.name} @ ${new Date().toTimeString().substring(0, 8)}`,
    })
      .then(() => {
        alertToaster.addAlert(alert);
      })
      .catch((error: Error) => {
        const errorResults = parseError(error);
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to duplicate credential'),
          timeout: 5000,
          children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
        });
      })
      .finally(onComplete);
  };
}
