import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, useDashboardColumns, useGetPageUrl } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Project } from '../../interfaces/Project';
import { AwxRoute } from '../../main/AwxRoutes';
import { useProjectsColumns } from '../../resources/projects/hooks/useProjectsColumns';

export function AwxRecentProjectsCard() {
  const view = useAwxView<Project>({
    url: awxAPI`/projects/`,
    disableQueryString: true,
    defaultSort: 'modified',
    defaultSortDirection: 'desc',
  });
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/projects/`);
  const canCreateProject = Boolean(data && data.actions && data.actions['POST']);

  let columns = useProjectsColumns();
  columns = useDashboardColumns(columns);

  return (
    <PageDashboardCard
      id="projects-card"
      title={t('Projects')}
      subtitle={t('Recently updated projects')}
      width="md"
      height="md"
      linkText={t('View all Projects')}
      to={getPageUrl(AwxRoute.Projects)}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading projects')}
        emptyState={
          canCreateProject ? (
            <PageTableEmptyState
              title={t('There are currently no projects')}
              description={t('Create a project by clicking the button below.')}
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
              icon={PlusCircleIcon}
              title={t('You do not have permission to create a project')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
