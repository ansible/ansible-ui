import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DateTimeCell,
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { useDecisionEnvironmentColumns } from '../../Resources/decision-environments/hooks/useDecisionEnvironmentColumns';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { IEdaView } from '../../useEventDrivenView';

export function EdaDecisionEnvironmentsCard(props: { view: IEdaView<EdaDecisionEnvironment> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useDecisionEnvironmentColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useMemo(
    () => [
      ...columns,
      {
        header: t('Modified'),
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
      title={t('Decision environments')}
      subtitle={t('Recently updated environments')}
      height="md"
      linkText={t('Go to decision environments')}
      to={RouteObj.EdaDecisionEnvironments}
      helpTitle={t('Decision environments')}
      help={t(
        'Decision environments contain a rulebook image that dictates where the rulebooks will run.'
      )}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading decision environments')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no decision environments')}
        emptyStateDescription={t('Create a decision environment by clicking the button below.')}
        emptyStateButtonText={t('Create decision environment')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaDecisionEnvironment)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
