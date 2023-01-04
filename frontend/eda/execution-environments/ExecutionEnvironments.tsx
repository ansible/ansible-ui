import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework/useInMemoryView';
import { useGet } from '../../common/useItem';
import { idKeyFn } from '../../hub/usePulpView';
import { RouteE } from '../../Routes';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsActions } from './hooks/useExecutionEnvironmentsActions';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const response = useGet<EdaExecutionEnvironment[]>('/api/execution-environments');
  const { data: executionEnvironments, mutate: refresh } = response;
  const tableColumns = useExecutionEnvironmentColumns();
  const view = useInMemoryView<EdaExecutionEnvironment>({
    items: executionEnvironments,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
    error: response.error as Error | undefined,
  });
  const toolbarActions = useExecutionEnvironmentsActions(refresh);
  const rowActions = useExecutionEnvironmentActions(refresh);
  const emptyStateButtonClick = useMemo(
    () => () => navigate(RouteE.CreateEdaExecutionEnvironment),
    [navigate]
  );
  return (
    <PageLayout>
      <PageHeader title={t('Execution environments')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateDescription={t('To get started, create a execution evironment.')}
        emptyStateButtonText={t('Create execution environment')}
        emptyStateButtonClick={emptyStateButtonClick}
        {...view}
      />
    </PageLayout>
  );
}
