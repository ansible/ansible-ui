import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsActions } from './hooks/useExecutionEnvironmentsActions';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const tableColumns = useExecutionEnvironmentColumns();
  const view = useEdaView<EdaExecutionEnvironment>({
    url: `${API_PREFIX}/execution-environments/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useExecutionEnvironmentsActions(view);
  const rowActions = useExecutionEnvironmentActions(view);
  const emptyStateButtonClick = useMemo(
    () => () => navigate(RouteObj.CreateEdaExecutionEnvironment),
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
