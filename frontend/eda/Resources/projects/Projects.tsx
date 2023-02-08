import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useInMemoryView } from '../../../../framework/useInMemoryView';
import { useGet } from '../../../common/useItem';
import { idKeyFn } from '../../../hub/usePulpView';
import { RouteE } from '../../../Routes';
import { EdaProject } from '../../interfaces/EdaProject';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';
import { API_PREFIX } from '../../constants';

export function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useProjectFilters();
  const { data: projects, mutate: refresh } = useGet<EdaProject[]>(`${API_PREFIX}/projects`);
  const tableColumns = useProjectColumns();
  const view = useInMemoryView<EdaProject>({
    items: projects,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  });
  const toolbarActions = useProjectsActions(refresh);
  const rowActions = useProjectActions(refresh);
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
