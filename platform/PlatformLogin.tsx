import { Login } from '../frontend/common/Login';
import { useGet } from '../frontend/common/crud/useGet';
import { useGetPageUrl } from '../framework/PageNavigation/useGetPageUrl';
import { UIAuth } from './interfaces/UIAuth';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformLogin() {
  const { data: options } = useGet<UIAuth>('/api/gateway/v1/ui_auth/');
  const getPageUrl = useGetPageUrl();
  const hideInputs = options ? !options.show_login_form : false;

  return (
    <Login
      apiUrl="/api/gateway/v1/login/"
      onLoginUrl={getPageUrl(PlatformRoute.Dashboard)}
      hideInputs={hideInputs}
      authOptions={options?.ssos}
    />
  );
}
