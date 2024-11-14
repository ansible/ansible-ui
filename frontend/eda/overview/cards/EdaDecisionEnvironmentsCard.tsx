import { PageTable, useDashboardColumns, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { useDecisionEnvironmentColumns } from '../../decision-environments/hooks/useDecisionEnvironmentColumns';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaDecisionEnvironmentsCard() {
  const view = useEdaView<EdaDecisionEnvironmentRead>({
    url: edaAPI`/decision-environments/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  let columns = useDecisionEnvironmentColumns();
  columns = useDashboardColumns(columns);

  return (
    <PageDashboardCard
      title={t('Decision Environments')}
      subtitle={t('Recently updated decision environments')}
      height="md"
      linkText={t('View all Decision Environments')}
      to={getPageUrl(EdaRoute.DecisionEnvironments)}
      helpTitle={t('Decision Environments')}
      help={t('Decision environments are a container image to run Ansible rulebooks.')}
    >
      <PageTable
        id="eda-dashboard-decision-environments-table"
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading decision environments')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no decision environments')}
            description={t('Create a decision environment by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(EdaRoute.CreateDecisionEnvironment)}
            >
              {t('Create decision environment')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
