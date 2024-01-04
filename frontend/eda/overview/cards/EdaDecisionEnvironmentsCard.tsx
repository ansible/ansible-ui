import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DateTimeCell,
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useGetPageUrl,
  usePageNavigate,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { IEdaView } from '../../common/useEventDrivenView';
import { useDecisionEnvironmentColumns } from '../../decision-environments/hooks/useDecisionEnvironmentColumns';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaDecisionEnvironmentsCard(props: { view: IEdaView<EdaDecisionEnvironment> }) {
  const { view } = props;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useDecisionEnvironmentColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useMemo(
    () => [
      ...columns,
      {
        header: t('Last modified'),
        cell: (project) =>
          project.modified_at && <DateTimeCell format="date-time" value={project.modified_at} />,
      },
    ],
    [columns, t]
  );
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  return (
    <PageDashboardCard
      title={t('Decision Environments')}
      subtitle={t('Recently updated environments')}
      height="md"
      linkText={t('Go to Decision Environments')}
      to={getPageUrl(EdaRoute.DecisionEnvironments)}
      helpTitle={t('Decision environments')}
      help={t('Decision environments are a container image to run Ansible rulebooks.')}
    >
      <PageTable
        id="eda-dashboard-decision-environments-table"
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading decision environments')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no decision environments')}
        emptyStateDescription={t('Create a decision environment by clicking the button below.')}
        emptyStateButtonText={t('Create Decision Environment')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateDecisionEnvironment)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
