import { Divider } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable, useVisibleModalColumns } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { useProjectColumns } from '../../Resources/projects/hooks/useProjectColumns';
import { EdaProject } from '../../interfaces/EdaProject';
import { IEdaView } from '../../useEventDrivenView';

export function ProjectsCard(props: { view: IEdaView<EdaProject> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useProjectColumns();
  const columns = useVisibleModalColumns(tableColumns);
  return (
    <PageDashboardCard
      title={view.itemCount === 0 ? undefined : t('Projects')}
      height="xxl"
      linkText={t('Go to Projects')}
      to={RouteObj.EdaProjects}
      style={{ overflow: 'hidden' }}
      helpTitle={t('Projects')}
      help={t('Projects are a logical collection of playbooks.')}
    >
      {view.itemCount !== 0 && <Divider />}
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
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
    </PageDashboardCard>
  );
}
