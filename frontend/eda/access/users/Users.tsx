import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaUser } from '../../interfaces/EdaUser';
import { EdaRoute } from '../../main/EdaRoutes';
import { useUserActions } from './hooks/useUserActions';
import { useUserColumns } from './hooks/useUserColumns';
import { useUserFilters } from './hooks/useUserFilters';
import { useUsersActions } from './hooks/useUsersActions';

export function Users() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('EDA');
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useUserFilters();
  const tableColumns = useUserColumns();
  const view = useEdaView<EdaUser>({
    url: edaAPI`/users/`,
    tableColumns,
    toolbarFilters,
  });
  const toolbarActions = useUsersActions(view);
  const rowActions = useUserActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Users')}
        titleHelpTitle={t('Users')}
        titleHelp={t(
          'A user is someone who has access to {{product}} with associated permissions and credentials.'
        )}
        description={t(
          'A user is someone who has access to {{product}} with associated permissions and credentials.',
          { product }
        )}
      />
      <PageTable
        id="eda-users-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no users created for your organization.')}
            description={t('Please create a user by using the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(EdaRoute.CreateUser)}
            >
              {t('Create user')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        {...view}
        defaultSubtitle={t('User')}
      />
    </PageLayout>
  );
}
