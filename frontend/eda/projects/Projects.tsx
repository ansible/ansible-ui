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
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/projects/`);
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useProjectActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Projects')}
        titleHelpTitle={t('Projects')}
        titleHelp={t('Projects are a logical collection of rulebooks.')}
        description={t('Projects are a logical collection of rulebooks.')}
      />
      <PageTable
        id="eda-projects-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={
          canCreateProject
            ? t('There are currently no projects created for your organization.')
            : t('You do not have permission to create a project.')
        }
        emptyStateDescription={
          canCreateProject
            ? t('Please create a project by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateProject ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateProject ? t('Create project') : undefined}
        emptyStateButtonClick={
          canCreateProject ? () => pageNavigate(EdaRoute.CreateProject) : undefined
        }
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
