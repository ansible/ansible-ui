import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageToolbar,
  useGetPageUrl,
} from '../../../../../framework';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../AwxRoutes';

export function useWorkflowVisualizerToolbarActions(setIsOpen: (isOpen: boolean) => void) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();

  const toolbarActions = useMemo<IPageAction<WorkflowJobTemplate>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Add node'),
        selection: PageActionSelection.None,
        icon: PlusCircleIcon,
        onClick: () => {
          setIsOpen(true);
        },
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.link,
        isPinned: true,
        label: t('Cancel'),
        href: getPageUrl(AwxRoute.WorkflowJobTemplateDetails, { params: { id: params.id } }),
      },
    ],
    [t, setIsOpen, getPageUrl, params]
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
