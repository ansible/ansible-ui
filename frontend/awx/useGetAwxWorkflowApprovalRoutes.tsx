import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';

export function useGetAwxWorkflowApprovalRoutes() {
  const { t } = useTranslation();
  const workflowApprovalRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.WorkflowApprovals,
      label: t('Workflow Approvals'),
      path: 'workflow-approvals',
      children: [
        {
          id: AwxRoute.WorkflowApprovalPage,
          path: ':id/*',
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
