import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns } from '../../../../framework';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';

export function PlatformOrganizationDetails() {
  const columns = useOrganizationColumns();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: organization } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${id.toString()}/`
  );
  return (
    <PageDetails>
      <PageDetailsFromColumns item={organization} columns={columns} />;
    </PageDetails>
  );
}
