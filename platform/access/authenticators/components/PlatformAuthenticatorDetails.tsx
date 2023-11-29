import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { Authenticator } from '../../../interfaces/Authenticator';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PageNotImplemented } from '../../../../framework';

export function PlatformAuthenticatorDetails() {
  const params = useParams<{ id: string }>();
  const { data: authenticator } = useGetItem<Authenticator>(
    gatewayAPI`/v1/authenticators`,
    params.id
  );

  if (!authenticator) {
    return null;
  }

  return <PageNotImplemented />;
}
