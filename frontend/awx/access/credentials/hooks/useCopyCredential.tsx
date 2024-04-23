import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';

export function useCopyCredential(onComplete?: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyCredential = (credential: Credential) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${credential.name} copied.`),
      timeout: 2000,
    };
    postRequest(awxAPI`/credentials/${credential.id.toString()}/copy/`, {
      name: `${credential.name} @ ${new Date()
        .toTimeString()
        .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
    })
      .then(() => {
        alertToaster.addAlert(alert);
      })
      .catch((error) => {
        alertToaster.replaceAlert(alert, {
          variant: 'danger',
          title: t('Failed to copy credential'),
          children: error instanceof Error && error.message,
        });
      })
      .finally(onComplete);
  };
  return copyCredential;
}
