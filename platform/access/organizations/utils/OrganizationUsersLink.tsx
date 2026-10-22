import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Link } from 'react-router-dom';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

export function OrganizationUsersLink(props: {
  organizationName: string;
  organizationId?: string | number;
}) {
  const getPageUrl = useGetPageUrl();
  const { data: itemsResponse } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    props.organizationId ? undefined : gatewayAPI`/organizations/`,
    props.organizationId ? undefined : { name: props.organizationName }
  );

  const organizationId =
    props.organizationId !== undefined && props.organizationId !== ''
      ? String(props.organizationId)
      : itemsResponse?.results?.[0]?.id;

  if (!organizationId) {
    return <span>{props.organizationName}</span>;
  }

  return (
    <Link
      to={getPageUrl(PlatformRoute.OrganizationUsers, {
        params: {
          id: organizationId,
        },
      })}
    >
      {props.organizationName}
    </Link>
  );
}
