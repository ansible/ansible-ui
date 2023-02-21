import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaProject } from '../../interfaces/EdaProject';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useProjectFilters();
  const tableColumns = useProjectColumns();
  const view = useEdaView<EdaProject>({
    url: `${API_PREFIX}/projects/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useProjectsActions(view);
  const rowActions = useProjectActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Projects')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={t('No projects yet')}
        emptyStateDescription={t('To get started, create a project.')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
