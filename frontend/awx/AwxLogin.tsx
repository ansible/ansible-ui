import { Login } from '../common/Login';
import type { AuthOptions } from '../common/SocialAuthLogin';
import { useGet } from '../common/crud/useGet';
import { RouteObj, useRoutesWithoutPrefix } from '../common/Routes';

export function AwxLogin() {
  const { data: options } = useGet<AuthOptions>('/api/v2/auth/');
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.AWX);

  return (
    <Login
      authOptions={options}
      apiUrl="/api/login/"
      onLoginUrl={RouteObjWithoutPrefix.Dashboard}
    />
  );
}
