import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Project } from '../../interfaces/Project';
import { AwxRoute } from '../../main/AwxRoutes';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectToolbarActions } from './hooks/useProjectToolbarActions';
import { useProjectsColumns } from './hooks/useProjectsColumns';
import { useProjectsFilters } from './hooks/useProjectsFilters';

export function Projects() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const getPageUrl = useGetPageUrl();
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
        title={t('Automation Execution Projects')}
        titleHelpTitle={t('Automation Execution Projects')}
        titleHelp={t(
          `A project is a logical collection of Ansible playbooks, represented in {{product}}. You can manage playbooks and playbook directories by either placing them manually under the Project Base Path on your {{product}} server, or by placing your playbooks into a source code management (SCM) system supported by {{product}}, including Git, Subversion, Mercurial, and Red Hat Insights.`,
          { product }
        )}
        titleDocLink={useGetDocsUrl(config, 'projects')}
        description={t(
          `A project is a logical collection of Ansible playbooks, represented in {{product}}.`,
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
        emptyState={
          canCreateProject ? (
            <PageTableEmptyState
              title={t('There are currently no projects added to your organization.')}
              description={t('Please create a project by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(AwxRoute.CreateProject)}
              >
                {t('Create project')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a project')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
        defaultSubtitle={t('Project')}
      />
    </PageLayout>
  );
}
