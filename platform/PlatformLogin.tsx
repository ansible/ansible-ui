import { Login } from '../frontend/common/Login';
import { useGet } from '../frontend/common/crud/useGet';
import { useGetPageUrl } from '../framework/PageNavigation/useGetPageUrl';
import { UIAuth } from './interfaces/UIAuth';
import { PlatformRoute } from './PlatformRoutes';
import { gatewayAPI } from './api/gateway-api-utils';

export function PlatformLogin() {
  const { data: options } = useGet<UIAuth>(gatewayAPI`/v1/ui_auth/`);
  const getPageUrl = useGetPageUrl();
  const hideInputs = options ? !options.show_login_form : false;

  return (
    <Login
      apiUrl={gatewayAPI`/v1/login/`}
      onLoginUrl={getPageUrl(PlatformRoute.Dashboard)}
      hideInputs={hideInputs}
      authOptions={options?.ssos}
    />
  );
}
