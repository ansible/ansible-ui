import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageToolbar,
} from '../../../../../framework';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { Badge, Button, ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  CloseIcon,
  CompressAltIcon,
  ExpandAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { IPageCustomToolbarRightAligned } from '../../../../../framework/PageActions/PageCustomToolbarRightAligned';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';

export function useWorkflowVisualizerToolbarActions(
  [_isSidePanelOpen, setIsSidePanelOpen]: [boolean, (isOpen: boolean) => void],
  setToggleExitWarningModal: (isOpen: boolean) => void,
  visualizerHasUnsavedChanges: boolean,
  nodes: WorkflowNode[] | []
) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const handleCancel = useCallback(() => {
    setToggleExitWarningModal(true);
  }, [setToggleExitWarningModal]);

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

  const toolbarMiscellaneous = useMemo<IPageCustomToolbarRightAligned[]>(
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
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            variant="plain"
          >
            {isExpanded ? <CompressAltIcon /> : <ExpandAltIcon />}
          </Button>
        ),
        tooltip: t('Expand'),
      },
      {
        key: 'close',
        element: (
          <Button
            data-cy="workflowVisualizerToolbarClose"
            aria-label={t('Close')}
            onClick={handleCancel}
            variant="plain"
          >
            <CloseIcon />
          </Button>
        ),
        tooltip: t('Close'),
      },
    ],
    [t, nodes.length, handleCancel, isExpanded, setIsExpanded]
  );

  return (
    <PageToolbar
      disablePagination
      itemCount={10}
      customToolbarRightAligned={toolbarMiscellaneous}
      toolbarActions={toolbarActions}
      keyFn={() => parseInt(params.id as string, 10)}
    />
  );
}
