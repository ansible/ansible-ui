import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';

export function useCopyInventory(onComplete: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyInventory = (inventory: Inventory) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${inventory.name} duplicated.`),
      timeout: 2000,
    };
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/copy/`, {
      name: `${inventory.name} @ ${new Date()
        .toTimeString()
        .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
    })
      .then(() => {
        alertToaster.addAlert(alert);
      })
      .catch((error) => {
        alertToaster.replaceAlert(alert, {
          variant: 'danger',
          title: t('Failed to duplicate inventory'),
          children: error instanceof Error && error.message,
        });
      })
      .finally(onComplete);
  };
  return copyInventory;
}
