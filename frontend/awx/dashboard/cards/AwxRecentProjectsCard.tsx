import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { useModifiedColumn } from '../../../common/columns';
import { Project } from '../../interfaces/Project';
import { useProjectsColumns } from '../../resources/projects/hooks/useProjectsColumns';
import { IAwxView } from '../../useAwxView';

export function AwxRecentProjectsCard(props: {
  view: IAwxView<Project>;
  showEmptyStateNonAdmin: boolean;
}) {
  const { view, showEmptyStateNonAdmin } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modifiedColumn = useModifiedColumn();

  let columns = useProjectsColumns();
  columns = useVisibleModalColumns(columns);
  columns = useMemo(() => [...columns, modifiedColumn], [columns, modifiedColumn]);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  return (
    <PageDashboardCard
      title={t('Recent Projects')}
      subtitle={t('Recently updated projects')}
      width="lg"
      height="md"
      linkText={t('Go to Projects')}
      to={RouteObj.Projects}
    >
      {showEmptyStateNonAdmin ? (
        <PageTable
          disableBodyPadding={true}
          tableColumns={columns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading projects')}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no projects')}
          {...view}
          compact
          itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
          pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
          disableLastRowBorder
        />
      ) : (
        <PageTable
          disableBodyPadding={true}
          tableColumns={columns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading projects')}
          emptyStateIcon={PlusCircleIcon}
          emptyStateButtonIcon={<PlusCircleIcon />}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no projects')}
          emptyStateDescription={t('Create a project by clicking the button below.')}
          emptyStateButtonText={t('Create project')}
          emptyStateButtonClick={() => navigate(RouteObj.CreateProject)}
          {...view}
          compact
          itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
          pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
          disableLastRowBorder
        />
      )}
    </PageDashboardCard>
  );
}
