import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionEnvironmentAddUsers } from '../../administration/execution-environments/components/ExecutionEnvironmentAddUsers';
import { ExecutionEnvironmentAssignTeams } from '../../administration/execution-environments/components/ExecutionEnvironmentAssignTeams';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from '../../administration/execution-environments/ExecutionEnvironmentForm';
import { ExecutionEnvironmentDetails } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentDetails';
import { ExecutionEnvironmentPage } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentPage';
import { ExecutionEnvironmentTeamAccess } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTeamAccess';
import { ExecutionEnvironmentTemplates } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTemplates';
import { ExecutionEnvironmentUserAccess } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentUserAccess';
import { ExecutionEnvironments } from '../../administration/execution-environments/ExecutionEnvironments';
import { AwxRoute } from '../AwxRoutes';
import { ExecutionEnvironmentManageUsers } from '../../administration/execution-environments/components/ExecutionEnvironmentManageUsers';

export function useAwxExecutionEnvironmentRoutes() {
  const { t } = useTranslation();
  const executionEnironmentRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ExecutionEnvironments,
      label: t('Execution Environments'),
      path: 'execution-environments',
      children: [
        {
          id: AwxRoute.ExecutionEnvironmentPage,
          path: ':id',
          element: <ExecutionEnvironmentPage />,
          children: [
            {
              id: AwxRoute.ExecutionEnvironmentDetails,
              path: 'details',
              element: <ExecutionEnvironmentDetails />,
            },
            {
              id: AwxRoute.ExecutionEnvironmentTemplates,
              path: 'templates',
              element: <ExecutionEnvironmentTemplates />,
            },
            {
              id: AwxRoute.ExecutionEnvironmentTeamAccess,
              path: 'team-access',
              element: <ExecutionEnvironmentTeamAccess />,
            },
            {
              id: AwxRoute.ExecutionEnvironmentUserAccess,
              path: 'user-access',
              element: <ExecutionEnvironmentUserAccess />,
            },
          ],
        },
        {
          path: '',
          element: <ExecutionEnvironments />,
        },
        {
          id: AwxRoute.CreateExecutionEnvironment,
          path: 'add',
          element: <CreateExecutionEnvironment />,
        },
        {
          id: AwxRoute.EditExecutionEnvironment,
          path: ':id/edit',
          element: <EditExecutionEnvironment />,
        },
        {
          id: AwxRoute.ExecutionEnvironmentAddUsers,
          path: ':id/user-access/add',
          element: <ExecutionEnvironmentAddUsers />,
        },
        {
          id: AwxRoute.ExecutionEnvironmentManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <ExecutionEnvironmentManageUsers />,
        },
        {
          id: AwxRoute.ExecutionEnvironmentAssignTeams,
          path: ':id/team-access/assign',
          element: <ExecutionEnvironmentAssignTeams />,
        },
      ],
    }),
    [t]
  );
  return executionEnironmentRoutes;
}
