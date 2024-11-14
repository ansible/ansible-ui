import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { PageTableViewTypeE } from '@ansible/ansible-ui-framework/PageToolbar/PageTableViewType';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { EdaRoute } from '../main/EdaRoutes';
import { useDecisionEnvironmentActions } from './hooks/useDecisionEnvironmentActions';
import { useDecisionEnvironmentsColumns } from './hooks/useDecisionEnvironmentColumns';
import { useDecisionEnvironmentFilters } from './hooks/useDecisionEnvironmentFilters';
import { useDecisionEnvironmentsActions } from './hooks/useDecisionEnvironmentsActions';

export function DecisionEnvironments() {
  const { t } = useTranslation();
  const getPageUr = useGetPageUrl();
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
        titleHelpTitle={t('Decision Environments')}
        titleHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
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
        emptyState={
          canCreateDE ? (
            <PageTableEmptyState
              title={t(
                'There are currently no decision environments created for your organization.'
              )}
              description={t('Please create a decision environment by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUr(EdaRoute.CreateDecisionEnvironment)}
              >
                {t('Create decision environment')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a decision environment.')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
        defaultSubtitle={t('Decision Environment')}
      />
    </PageLayout>
  );
}
