import { usePageAlertToaster, usePageDialogs } from '@ansible/ansible-ui-framework';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import {
  Button,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../common/api/awx-utils';

export interface RevertAllModalProps {
  categorySlugs: string[];
  onComplete: () => void;
}

export function useRevertAllSettingsModal() {
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
  const { categorySlugs, onComplete, popDialog } = props;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const deleteRequest = useDeleteRequest();

  const onRevertAll = useCallback(async () => {
    try {
      await Promise.all(
        categorySlugs.map(async (category) => {
          await deleteRequest(awxAPI`/settings/${category}/`);
        })
      ).then(() => {
        onComplete();
      });
    } catch (error) {
      const { genericErrors, fieldErrors } = awxErrorAdapter(error);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to revert settings'),
        children: (
          <>
            {genericErrors?.map((err) => err.message)}
            {fieldErrors?.map((err) => err.message)}
          </>
        ),
      });
    } finally {
      popDialog();
    }
  }, [t, alertToaster, categorySlugs, deleteRequest, onComplete, popDialog]);

  return (
    <Modal
      data-cy="revert-settings-modal"
      data-testid="revert-settings-modal"
      aria-label={t('Revert settings confirmation dialog')}
      variant={ModalVariant.small}
      isOpen
      onClose={() => popDialog()}
    >
      <ModalHeader title={t('Revert settings')} titleIconVariant="warning" />
      <ModalBody>
        {t(
          `This will revert all configuration values on this page to their factory defaults. Are you sure you want to proceed?`
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="delete-group-modal-delete-button"
          data-testid="delete-group-modal-delete-button"
          ouiaId="delete-group-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => {
            Promise.resolve(onRevertAll()).catch(() => {});
          }}
          aria-label={t`Confirm revert all`}
        >
          {t('Revert all')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => popDialog()}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
