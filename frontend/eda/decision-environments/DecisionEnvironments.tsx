import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { useDecisionEnvironmentActions } from './hooks/useDecisionEnvironmentActions';
import { useDecisionEnvironmentColumns } from './hooks/useDecisionEnvironmentColumns';
import { useDecisionEnvironmentFilters } from './hooks/useDecisionEnvironmentFilters';
import { useDecisionEnvironmentsActions } from './hooks/useDecisionEnvironmentsActions';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

export function DecisionEnvironments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useDecisionEnvironmentFilters();
  const tableColumns = useDecisionEnvironmentColumns();
  const view = useEdaView<EdaDecisionEnvironment>({
    url: `${API_PREFIX}/decision-environments/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useDecisionEnvironmentsActions(view);
  const rowActions = useDecisionEnvironmentActions(view);
  const emptyStateButtonClick = useMemo(
    () => () => navigate(RouteObj.CreateEdaDecisionEnvironment),
    [navigate]
  );
  return (
    <PageLayout>
      <PageHeader title={t('Decision environments')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateDescription={t('To get started, create a decision environment.')}
        emptyStateButtonText={t('Create decision environment')}
        emptyStateButtonClick={emptyStateButtonClick}
        {...view}
      />
    </PageLayout>
  );
}
