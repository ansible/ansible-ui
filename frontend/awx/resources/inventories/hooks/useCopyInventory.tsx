import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Inventory } from '../../../interfaces/Inventory';

export function useCopyInventory(onComplete: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyInventory = (inventory: Inventory) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${inventory.name} copied.`),
      timeout: 2000,
    };
    postRequest(`/api/v2/inventories/${inventory.id}/copy/`, {
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
          title: t('Failed to copy inventory'),
          children: error instanceof Error && error.message,
        });
      })
      .finally(onComplete);
  };
  return copyInventory;
}
