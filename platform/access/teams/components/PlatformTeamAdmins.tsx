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
import {
  useTeamAdminsRowActions,
  useTeamAdminsToolbarActions,
} from '../hooks/useTeamAdminsActions';

export function PlatformTeamAdmins() {
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
    url: gatewayV1API`/teams/${team?.id?.toString() ?? ''}/admins`,
    toolbarFilters,
    tableColumns,
  });

  const { data: associateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/teams/${team?.id?.toString() ?? ''}/admins/associate`
  );
  const canAssociateAdministrator = Boolean(
    associateOptions && associateOptions.actions && associateOptions.actions['POST']
  );
  const toolbarActions = useTeamAdminsToolbarActions(view);
  const rowActions = useTeamAdminsRowActions(view);

  if (isLoading) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformUser>
      id="platform-admins-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading administrators')}
      emptyStateTitle={
        canAssociateAdministrator
          ? t('There are currently no administrators associated with this team.')
          : t('You do not have permission to associate an administrators with this team.')
      }
      emptyStateDescription={
        canAssociateAdministrator
          ? t('Associate administrators by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canAssociateAdministrator ? undefined : CubesIcon}
      emptyStateButtonText={canAssociateAdministrator ? t('Associate administrators') : undefined}
      emptyStateActions={canAssociateAdministrator ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
