import { TextCell } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { UserRoleAccess } from '../interfaces/UserRoleAccess';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';

export function UserFirstNameCell(props: { userAccess?: UserRoleAccess }) {
  const roleArray = props?.userAccess?.related?.details?.split('/');
  const ansibleId =
    roleArray && roleArray?.length >= 2 ? roleArray[roleArray.length - 2] : undefined;
  const { data } = useGet<PlatformItemsResponse<PlatformUser>>(
    ansibleId ? gatewayAPI`/users/?resource__ansible_id=${ansibleId}` : undefined,
    {},
    {
      dedupingInterval: 10 * 1000,
    }
  );
  const firstName = data?.results && data.results?.length > 0 ? data.results[0]?.first_name : '';
  return <TextCell text={firstName} />;
}
