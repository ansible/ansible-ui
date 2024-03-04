import { useTranslation } from 'react-i18next';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { LoadingPage, PageTable } from '../../../../framework';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useParams } from 'react-router-dom';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { CubesIcon } from '@patternfly/react-icons';
import { useTeamUsersRowActions, useTeamUsersToolbarActions } from '../hooks/useTeamUsersActions';

export function PlatformTeamUsers() {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const params = useParams<{ id: string }>();
  const {
    data: team,
    isLoading,
    error,
  } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);

  const view = usePlatformView<PlatformUser>({
    url: gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: associateOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/associate/`);
  const canAssociateUser = Boolean(
    associateOptions && associateOptions.actions && associateOptions.actions['POST']
  );
  const toolbarActions = useTeamUsersToolbarActions(view);
  const rowActions = useTeamUsersRowActions(view);

  if (isLoading || isLoadingOptions) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformUser>
      id="platform-users-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={
        canAssociateUser
          ? t('There are currently no users added to this team.')
          : t('You do not have permission to add a user to this team.')
      }
      emptyStateDescription={
        canAssociateUser
          ? t('Add users by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canAssociateUser ? undefined : CubesIcon}
      emptyStateButtonText={canAssociateUser ? t('Add users') : undefined}
      emptyStateActions={canAssociateUser ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
