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
import { useAwxView } from '../../useAwxView';

export function AwxRecentProjectsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modifiedColumn = useModifiedColumn();

  let columns = useProjectsColumns();
  columns = useVisibleModalColumns(columns);
  columns = useMemo(() => [...columns, modifiedColumn], [columns, modifiedColumn]);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  const view = useAwxView<Project>({
    url: '/api/v2/projects/',
    disableQueryString: true,
    defaultSort: 'modified',
    defaultSortDirection: 'desc',
  });
  return (
    <PageDashboardCard
      title={t('Projects')}
      subtitle={t('Recently updated projects')}
      width="lg"
      rows="md"
      linkText={t('Go to Projects')}
      to={RouteObj.Projects}
    >
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
        emptyStateButtonClick={() => navigate(RouteObj.CreateProjectTemplate)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
