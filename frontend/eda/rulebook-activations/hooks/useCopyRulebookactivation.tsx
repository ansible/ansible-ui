import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function useCopyRulebookActivation(onComplete?: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  return (rulebookActivation: EdaRulebookActivation) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${rulebookActivation.name} duplicated.`),
      timeout: 2000,
    };
    postRequest(edaAPI`/activations/${rulebookActivation.id.toString()}/copy/`, {
      name: `${rulebookActivation.name} @ ${new Date().toTimeString().substring(0, 7)}`,
    })
      .then(() => {
        alertToaster.addAlert(alert);
      })
      .catch((error) => {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to duplicate the rulebook activation'),
          timeout: 2000,
          children:
            error instanceof Error &&
            (error.message === 'Forbidden'
              ? t('You do not have permission to duplicate this rulebook activation')
              : error.message),
        });
      })
      .finally(onComplete);
  };
}
