import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { PageTableViewTypeE } from '../../../framework/PageToolbar/PageTableViewType';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../main/EdaRoutes';
import { useDecisionEnvironmentActions } from './hooks/useDecisionEnvironmentActions';
import { useDecisionEnvironmentsColumns } from './hooks/useDecisionEnvironmentColumns';
import { useDecisionEnvironmentFilters } from './hooks/useDecisionEnvironmentFilters';
import { useDecisionEnvironmentsActions } from './hooks/useDecisionEnvironmentsActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function DecisionEnvironments() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useDecisionEnvironmentFilters();
  const tableColumns = useDecisionEnvironmentsColumns();
  const view = useEdaView<EdaDecisionEnvironment>({
    url: edaAPI`/decision-environments/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useDecisionEnvironmentsActions(view);
  const rowActions = useDecisionEnvironmentActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Decision Environments')}
        description={t('Decision environments are a container image to run Ansible rulebooks.')}
      />
      <PageTable
        id="eda-decision-environments-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        defaultTableView={PageTableViewTypeE.Cards}
        rowActions={rowActions}
        errorStateTitle={t('Error loading decision environments')}
        emptyStateTitle={t(
          'There are currently no decision environments created for your organization.'
        )}
        emptyStateDescription={t('Please create a decision environment by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create decision environment')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateDecisionEnvironment)}
        {...view}
        defaultSubtitle={t('Decision Environment')}
      />
    </PageLayout>
  );
}
