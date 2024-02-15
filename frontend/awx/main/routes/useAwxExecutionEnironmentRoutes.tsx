import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { ExecutionEnvironmentPage } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentPage';
import { ExecutionEnvironments } from '../../administration/execution-environments/ExecutionEnvironments';
import { ExecutionEnvironmentDetails } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentDetails';
import { AwxRoute } from '../AwxRoutes';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from '../../administration/execution-environments/ExecutionEnvironmentForm';
import { ExecutionEnvironmentTemplates } from '../../administration/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTemplates';

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
      ],
    }),
    [t]
  );
  return executionEnironmentRoutes;
}
