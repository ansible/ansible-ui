import { useGetPageUrl } from '../../framework/PageNavigation/useGetPageUrl';
import { Login } from '../../frontend/common/Login';
import { useGet } from '../../frontend/common/crud/useGet';
import { gatewayAPI } from '../api/gateway-api-utils';
import { UIAuth } from '../interfaces/UIAuth';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformLogin() {
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const getPageUrl = useGetPageUrl();
  const hideInputs = options ? !options.show_login_form : false;

  return (
    <Login
      apiUrl={gatewayAPI`/login/`}
      onLoginUrl={getPageUrl(PlatformRoute.Overview)}
      hideInputs={hideInputs}
      authOptions={options?.ssos}
    />
  );
}
