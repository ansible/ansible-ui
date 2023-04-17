import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaProject } from '../interfaces/EdaProject';
import { useEdaView } from '../useEventDrivenView';
import { useProjectColumns } from './hooks/useProjectColumns';

export function ProjectsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useProjectColumns();
  const view = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    viewPage: 1,
    viewPerPage: 4,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <PageDashboardCard
      title={view.itemCount === 0 ? undefined : t('Projects')}
      height="lg"
      to={RouteObj.EdaProjects}
    >
      <div style={{ flexGrow: 1 }}>
        <PageTable
          disableBodyPadding={true}
          tableColumns={tableColumns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading projects')}
          emptyStateIcon={CubesIcon}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no projects')}
          emptyStateDescription={t('Create a project by clicking the button below.')}
          emptyStateButtonText={t('Create project')}
          emptyStateButtonClick={() => navigate(RouteObj.CreateEdaProject)}
          {...view}
          defaultSubtitle={t('Project')}
          compact
        />
      </div>
    </PageDashboardCard>
  );
}
