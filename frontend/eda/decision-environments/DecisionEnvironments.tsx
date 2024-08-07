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
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/decision-environments/`);
  const canCreateDE = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useDecisionEnvironmentActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Decision Environments')}
        description={t('Decision environments are a container image to run Ansible rulebooks.')}
        titleHelpTitle={t('Decision Environments')}
        titleHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
      />
      <PageTable
        id="eda-decision-environments-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        defaultTableView={PageTableViewTypeE.Cards}
        rowActions={rowActions}
        errorStateTitle={t('Error loading decision environments')}
        emptyStateTitle={
          canCreateDE
            ? t('There are currently no decision environments created for your organization.')
            : t('You do not have permission to create a decision environment.')
        }
        emptyStateDescription={
          canCreateDE
            ? t('Please create a decision environment by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateDE ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateDE ? t('Create decision environment') : undefined}
        emptyStateButtonClick={
          canCreateDE ? () => pageNavigate(EdaRoute.CreateDecisionEnvironment) : undefined
        }
        {...view}
        defaultSubtitle={t('Decision Environment')}
      />
    </PageLayout>
  );
}
