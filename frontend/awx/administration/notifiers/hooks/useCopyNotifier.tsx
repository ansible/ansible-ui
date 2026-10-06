import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { getCopyResourceName } from '@ansible/common-ui/utils/copyResourceName';
import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';

export function useCopyNotifier(onComplete: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyNotifier = (notification: NotificationTemplate) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${notification.name} duplicated.`),
      timeout: 2000,
    };
    postRequest(awxAPI`/notification_templates/${notification.id.toString()}/copy/`, {
      name: getCopyResourceName(notification.name),
    })
      .then(() => {
        alertToaster.addAlert(alert);
      })
      .catch((error) => {
        alertToaster.replaceAlert(alert, {
          variant: 'danger',
          title: t('Failed to duplicate notifier'),
          children: error instanceof Error && error.message,
        });
      })
      .finally(onComplete);
  };
  return copyNotifier;
}
