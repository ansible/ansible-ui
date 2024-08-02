import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { usePageAlertToaster } from '../../framework';
import { useDeleteRequest } from '../../frontend/common/crud/useDeleteRequest';
import { usePageDialogs } from '../../framework';
import { gatewayAPI } from '../api/gateway-api-utils';

export interface RevertAllModalProps {
  onComplete: () => void;
}

export function useRevertAllGatewaySettingsModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<RevertAllModalProps>();

  useEffect(() => {
    if (props) {
      pushDialog(<RevertAllDialog {...{ ...props, popDialog: popDialog }} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);

  return setProps;
}

export function RevertAllDialog(
  props: RevertAllModalProps & {
    popDialog: () => void;
  }
) {
  const { onComplete, popDialog } = props;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const deleteRequest = useDeleteRequest();

  const onRevertAll = useCallback(async () => {
    try {
      await deleteRequest(gatewayAPI`/settings/all/`).then(() => {
        onComplete();
      });
    } catch (_) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to revert settings'),
      });
    } finally {
      popDialog();
    }
  }, [t, alertToaster, deleteRequest, onComplete, popDialog]);

  return (
    <Modal
      title={t('Revert settings')}
      titleIconVariant="warning"
      data-cy="revert-settings-modal"
      aria-label={t('Revert settings confirmation dialog')}
      variant={ModalVariant.small}
      isOpen
      onClose={() => popDialog()}
      actions={[
        <Button
          data-cy="delete-group-modal-delete-button"
          ouiaId="delete-group-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => void onRevertAll()}
          aria-label={t`Confirm revert all`}
        >
          {t('Revert all')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => popDialog()}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      {t(
        `This will revert all configuration values on this page to their factory defaults. Are you sure you want to proceed?`
      )}
    </Modal>
  );
}
