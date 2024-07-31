import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Project } from '../../interfaces/Project';
import { AwxRoute } from '../../main/AwxRoutes';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectToolbarActions } from './hooks/useProjectToolbarActions';
import { useProjectsColumns } from './hooks/useProjectsColumns';
import { useProjectsFilters } from './hooks/useProjectsFilters';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';

export function Projects() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns();
  const view = useAwxView<Project>({
    url: awxAPI`/projects/`,
    toolbarFilters,
    tableColumns,
  });
  const showToastMessage = true;
  const toolbarActions = useProjectToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useProjectActions(view.unselectItemsAndRefresh, showToastMessage);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/projects/`);
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);
  const { refresh } = view;
  usePersistentFilters('projects');

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
              void refresh();
              break;
            case 'workflow_job':
              void refresh();
              break;
            case 'project_update':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
  );
  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Projects')}
        titleHelpTitle={t('Project')}
        titleHelp={t(
          `A Project is a logical collection of Ansible playbooks, represented in {{product}}. You can manage playbooks and playbook directories by either placing them manually under the Project Base Path on your {{product}} server, or by placing your playbooks into a source code management (SCM) system supported by {{product}}, including Git, Subversion, Mercurial, and Red Hat Insights.`,
          { product }
        )}
        titleDocLink={getDocsBaseUrl(config, 'projects')}
        description={t(
          `A Project is a logical collection of Ansible playbooks, represented in {{product}}.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'project'} />}
      />
      <PageTable<Project>
        id="awx-projects-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyStateTitle={
          canCreateProject
            ? t('There are currently no projects added to your organization.')
            : t('You do not have permission to create a project')
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
          canCreateProject ? () => pageNavigate(AwxRoute.CreateProject) : undefined
        }
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
