import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageDetails,
  PageDetailsFromColumns,
  PageNotFound,
} from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamColumns } from '../hooks/useTeamColumns';

export function PlatformTeamDetails() {
  const params = useParams<{ id: string }>();
  const { data: team, isLoading, error } = useGetItem<PlatformTeam>(gatewayAPI`/teams/`, params.id);
  const columns = useTeamColumns();
  if (isLoading) return <LoadingPage />;
  if (error) return <AwxError error={error} />;
  if (!team) return <PageNotFound />;
  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={team} />
    </PageDetails>
  );
}
