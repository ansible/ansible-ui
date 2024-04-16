import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaRoute } from '../main/EdaRoutes';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function Projects() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useProjectFilters();
  const tableColumns = useProjectColumns();
  const view = useEdaView<EdaProject>({
    url: edaAPI`/projects/`,
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
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateProject)}
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
