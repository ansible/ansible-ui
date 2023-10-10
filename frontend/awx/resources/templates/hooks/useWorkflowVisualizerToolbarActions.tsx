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
import { Badge, Button, ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, ExpandAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../AwxRoutes';
import { IPageToolbarMiscellaneous } from '../../../../../framework/PageActions/PageToolbarMiscellaneous';

export function useWorkflowVisualizerToolbarActions(
  [_isSidePanelOpen, setIsSidePanelOpen]: [boolean, (isOpen: boolean) => void],
  setToggleUnsaveChangesModal: (isOpen: boolean) => void,
  visualizerHasUnsavedChanges: boolean,
  nodes: WorkflowJobTemplate[] | []
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

  const toolbarMiscellaneous = useMemo<IPageToolbarMiscellaneous[]>(
    () => [
      {
        key: 'totalNodes',
        element: (
          <div data-cy="workflowVisualizerToolbarNodes">
            {t('Total nodes')} <Badge>{nodes.length || 0}</Badge>
          </div>
        ),
      },
      {
        key: 'expand',
        element: (
          <Button
            data-cy="workflowVisualizerToolbarExpandCollapse"
            aria-label={t('Expand or collapse')}
            onClick={() => {}}
            variant="plain"
          >
            <ExpandAltIcon />
          </Button>
        ),
        tooltip: t('Expand'),
      },
    ],
    [t, nodes.length]
  );

  return (
    <PageToolbar
      disablePagination
      itemCount={10}
      toolbarMiscellaneous={toolbarMiscellaneous}
      toolbarActions={toolbarActions}
      keyFn={() => parseInt(params.id as string, 10)}
    />
  );
}
