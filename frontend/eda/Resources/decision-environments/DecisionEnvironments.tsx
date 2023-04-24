import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { PageTableViewTypeE } from '../../../../framework/PageTable/PageTableViewType';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { useEdaView } from '../../useEventDrivenView';
import { useDecisionEnvironmentActions } from './hooks/useDecisionEnvironmentActions';
import { useDecisionEnvironmentColumns } from './hooks/useDecisionEnvironmentColumns';
import { useDecisionEnvironmentFilters } from './hooks/useDecisionEnvironmentFilters';
import { useDecisionEnvironmentsActions } from './hooks/useDecisionEnvironmentsActions';

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
  return (
    <PageLayout>
      <PageHeader
        title={t('Decision Environments')}
        description={t(
          'Decision environments contain a rulebook image that dictates where the rulebooks will run.'
        )}
      />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        defaultTableView={PageTableViewTypeE.Cards}
        rowActions={rowActions}
        errorStateTitle={t('Error loading decision environments')}
        emptyStateTitle={t('No decision environments yet')}
        emptyStateDescription={t('To get started, create a decision environment.')}
        emptyStateButtonText={t('Create Decision Environment')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaDecisionEnvironment)}
        {...view}
        defaultSubtitle={t('Decision environment')}
      />
    </PageLayout>
  );
}
