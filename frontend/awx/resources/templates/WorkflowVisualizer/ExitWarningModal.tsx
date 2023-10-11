import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageNavigate } from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { useParams } from 'react-router-dom';

export function ExitWarningModal(props: {
  hasUnsavedChanges: boolean;
  toggleModal: (isOpen: boolean) => void;
}) {
  const { hasUnsavedChanges, toggleModal } = props;
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  return (
    <Modal
      titleIconVariant={'warning'}
      title={hasUnsavedChanges ? t('Unsaved changes') : t('Exit Workflow Visualizer?')}
      aria-label={hasUnsavedChanges ? t('Unsaved changes') : t('Exit Workflow Visualizer?')}
      data-cy="visualizer-exit-warning-modal"
      isOpen
      onClose={() => toggleModal(false)}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          id="confirm"
          onClick={() => {
            if (hasUnsavedChanges) {
              // Save changes and navigate too details view
            }
            toggleModal(false);
            pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
          }}
        >
          {hasUnsavedChanges ? t('Save and exit') : t('Exit')}
        </Button>,
        <Button
          key="cancel"
          variant="plain"
          onClick={() => {
            if (hasUnsavedChanges) {
              // Has unsaved changes. Navigate to workflow details view and do not save
              pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
            }
            toggleModal(false);
          }}
        >
          {hasUnsavedChanges ? t('Exit without saving') : t('Cancel')}
        </Button>,
      ]}
    >
      {t('Are you sure you want to exit?')}
      {hasUnsavedChanges
        ? t('There are unsave changes on this workflow.  Are you sure you want to discard them?')
        : null}
    </Modal>
  );
}
