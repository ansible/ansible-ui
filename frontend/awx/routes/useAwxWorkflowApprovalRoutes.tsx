import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { PageNotImplemented } from '../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';
import { WorkflowApprovalDetails } from '../views/workflow-approvals/WorkflowApprovalPage/WorkflowApprovalDetails';
import { WorkflowApprovalPage } from '../views/workflow-approvals/WorkflowApprovalPage/WorkflowApprovalPage';
import WorkflowApprovals from '../views/workflow-approvals/WorkflowApprovals';

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
          element: <WorkflowApprovalPage />,
          children: [
            {
              id: AwxRoute.WorkflowApprovalDetails,
              path: 'details',
              element: <WorkflowApprovalDetails />,
            },
            {
              id: AwxRoute.WorkflowApprovalWorkflowJobDetails,
              path: 'workflow-job-details',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <WorkflowApprovals />,
        },
      ],
    }),
    [t]
  );
  return workflowApprovalRoutes;
}
