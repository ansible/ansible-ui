import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Link } from 'react-router-dom';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

export function OrganizationUsersLink(props: { organizationName: string }) {
  const getPageUrl = useGetPageUrl();
  const { data: itemsResponse } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayAPI`/organizations/`,
    {
      name: props?.organizationName,
    }
  );

  return itemsResponse && itemsResponse?.results?.length >= 1 ? (
    <Link
      to={getPageUrl(PlatformRoute.OrganizationUsers, {
        params: {
          id: itemsResponse.results[0]?.id,
        },
      })}
    >
      {props?.organizationName}
    </Link>
  ) : (
    <div> {props?.organizationName} </div>
  );
}
