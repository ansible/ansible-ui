import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageNavigate } from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { useParams } from 'react-router-dom';

export function UnsavedChangesAlertModal(props: {
  modalState: [boolean, (isOpen: boolean) => void];
}) {
  const [_hasUnsavedChanges, setHasUnsavedChanges] = props.modalState;
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  return (
    <Modal
      title={t('Unsaved changes')}
      aria-label={t('Unsaved changes')}
      ouiaId={t('Unsaved changes')}
      isOpen
      onClose={() => setHasUnsavedChanges(false)}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          id="confirm"
          onClick={() => {
            setHasUnsavedChanges(false);
            pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
          }}
        >
          {t('Discard changes')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => setHasUnsavedChanges(false)}>
          {t('Cancel')}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      {t('There are unsave changes on this workflow.  Are you sure you want to discard them?')}
    </Modal>
  );
}
