import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { ExecutionEnvironments } from '../../administration/execution-environments/ExecutionEnvironments';
import { AwxRoute } from '../AwxRoutes';

export function useAwxExecutionEnvironmentRoutes() {
  const { t } = useTranslation();
  const executionEnironmentRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ExecutionEnvironments,
      label: t('Execution Environments'),
      path: 'execution-environments',
      element: <ExecutionEnvironments />,
    }),
    [t]
  );
  return executionEnironmentRoutes;
}
