import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaProject } from '../interfaces/EdaProject';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { EdaRoute } from '../main/EdaRoutes';
import { useProjectActions } from './hooks/useProjectActions';
import { useProjectColumns } from './hooks/useProjectColumns';
import { useProjectFilters } from './hooks/useProjectFilters';
import { useProjectsActions } from './hooks/useProjectsActions';
import { useEdaConfig } from '../common/useEdaConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';

export function Projects() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
  const config = useEdaConfig();
  return (
    <PageLayout>
      <PageHeader
        title={t('Projects')}
        description={t('A project is a logical collection of rulebooks.')}
        titleHelpTitle={t('Projects')}
        titleHelp={t('A project is a logical collection of rulebooks.')}
        titleDocLink={useGetDocsUrl(config, 'edaProjects')}
      />
      <PageTable
        id="eda-projects-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading projects')}
        emptyState={
          canCreateProject ? (
            <PageTableEmptyState
              title={t('There are currently no projects created for your organization.')}
              description={t('Please create a project by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(EdaRoute.CreateProject)}
              >
                {t('Create project')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a project.')}
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
