import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { WorkflowApprovalDetails } from '../../administration/workflow-approvals/WorkflowApprovalPage/WorkflowApprovalDetails';
import { WorkflowApprovalPage } from '../../administration/workflow-approvals/WorkflowApprovalPage/WorkflowApprovalPage';
import { WorkflowApprovals } from '../../administration/workflow-approvals/WorkflowApprovals';
import { AwxRoute } from '../AwxRoutes';
import { JobDetails } from '../../views/jobs/JobDetails';

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
              path: ':job_type/:job_id/job-details',
              element: <JobDetails />,
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
