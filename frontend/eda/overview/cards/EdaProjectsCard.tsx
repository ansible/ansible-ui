import {
  PageTable,
  useDashboardColumns,
  useGetPageUrl,
  useVisibleModalColumns,
} from '@ansible/ansible-ui-framework';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';
import { useProjectColumns } from '../../projects/hooks/useProjectColumns';

export function EdaRecentProjectsCard(props: { view: IEdaView<EdaProject> }) {
  const { view } = props;
  const { t } = useTranslation();
  const tableColumns = useProjectColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useDashboardColumns(columns);
  const getPageUrl = useGetPageUrl();
  return (
    <PageDashboardCard
      title={t('Projects')}
      subtitle={t('Recently updated projects')}
      height="md"
      width="md"
      linkText={t('View all Projects')}
      to={getPageUrl(EdaRoute.Projects)}
      helpTitle={t('Projects')}
      help={t('A project is a logical collection of rulebooks.')}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading projects')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no projects')}
            description={t('Create a project by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(EdaRoute.CreateProject)}
            >
              {t('Create project')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
