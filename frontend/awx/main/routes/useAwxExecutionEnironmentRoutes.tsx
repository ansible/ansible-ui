import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
} from '../../infrastructure/execution-environments/ExecutionEnvironmentForm';
import { ExecutionEnvironmentDetails } from '../../infrastructure/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentDetails';
import { ExecutionEnvironmentPage } from '../../infrastructure/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentPage';
import { ExecutionEnvironmentTemplates } from '../../infrastructure/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentTemplates';
import { ExecutionEnvironments } from '../../infrastructure/execution-environments/ExecutionEnvironments';
import { AwxRoute } from '../AwxRoutes';

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
