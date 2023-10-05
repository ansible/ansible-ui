import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageToolbar,
  usePageNavigate,
} from '../../../../../framework';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../AwxRoutes';

export function useWorkflowVisualizerToolbarActions(
  [_isSidePanelOpen, setIsSidePanelOpen]: [boolean, (isOpen: boolean) => void],
  setToggleUnsaveChangesModal: (isOpen: boolean) => void,
  visualizerHasUnsavedChanges: boolean
) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();

  const handleCancel = useCallback(() => {
    if (visualizerHasUnsavedChanges) {
      setToggleUnsaveChangesModal(true);
      return;
    }
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
      params: { id: params.id },
    });
  }, [visualizerHasUnsavedChanges, pageNavigate, params.id, setToggleUnsaveChangesModal]);

  const toolbarActions = useMemo<IPageAction<WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        isPinned: true,

        label: t('Save'),
        selection: PageActionSelection.None,
        icon: CheckCircleIcon,
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Add node'),
        selection: PageActionSelection.None,
        icon: PlusCircleIcon,
        onClick: () => {
          setIsSidePanelOpen(true);
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.link,
        isPinned: false,
        label: t('Cancel'),
        onClick: handleCancel,
      },
    ],
    [t, setIsSidePanelOpen, handleCancel]
  );

  return (
    <PageToolbar
      disablePagination
      itemCount={10}
      toolbarActions={toolbarActions}
      keyFn={() => parseInt(params.id as string, 10)}
    />
  );
}
