import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';
import { useEdaView } from '../../useEventDrivenView';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';

export function Projects() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
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
      <PageHeader
        title={t('Projects')}
        description={t('Projects are a logical collection of rulebooks.')}
      />
      <PageTable
        id="eda-projects-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={t('There are currently no projects created for your organization.')}
        emptyStateDescription={t('Please create a project by using the button below.')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateProject)}
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
