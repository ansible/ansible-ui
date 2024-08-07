import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageTable,
  useDashboardColumns,
  useGetPageUrl,
  usePageNavigate,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';
import { useProjectColumns } from '../../projects/hooks/useProjectColumns';

export function EdaRecentProjectsCard(props: { view: IEdaView<EdaProject> }) {
  const { view } = props;
  const { t } = useTranslation();
  const tableColumns = useProjectColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useDashboardColumns(columns);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  return (
    <PageDashboardCard
      title={t('Projects')}
      subtitle={t('Recently updated projects')}
      height="md"
      width="md"
      linkText={t('View all Projects')}
      to={getPageUrl(EdaRoute.Projects)}
      helpTitle={t('Projects')}
      help={t('A project is a logical collection of rulebooks.')}
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
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateProject)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
