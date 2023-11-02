import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { PageNotImplemented } from '../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';

export function useAwxWorkflowApprovalRoutes() {
  const { t } = useTranslation();
  const workflowApprovalRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.WorkflowApprovals,
      label: t('Workflow Approvals'),
      path: 'workflow-approvals',
      children: [
        {
          id: AwxRoute.WorkflowApprovalPage,
          path: ':id/',
          element: <PageNotImplemented />,
        },
        {
          path: '',
          element: <PageNotImplemented />,
        },
      ],
    }),
    [t]
  );
  return workflowApprovalRoutes;
}
