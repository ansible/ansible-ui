import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CloseIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageToolbar,
  usePageNavigate,
} from '../../../../../../framework';
import { IPageCustomToolbarRightAligned } from '../../../../../../framework/PageActions/IPageCustomToolbarRightAligned';
import { AwxRoute } from '../../../../AwxRoutes';

export function useWorkflowVisualizerToolbarActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();

  const handleCancel = useCallback(() => {
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } });
  }, [pageNavigate, params.id]);

  const toolbarActions = useMemo<IPageAction<WorkflowNode>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Add node'),
        selection: PageActionSelection.None,
        icon: PlusCircleIcon,
        onClick: () => {},
      },
    ],
    [t]
  );

  const rightAlignedToolbarItems = useMemo<IPageCustomToolbarRightAligned[]>(
    () => [
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
    [t, handleCancel]
  );

  return (
    <PageToolbar
      disablePagination
      itemCount={10}
      customToolbarRightAligned={rightAlignedToolbarItems}
      toolbarActions={toolbarActions}
      keyFn={() => parseInt(params.id as string, 10)}
    />
  );
}
