import { Login } from '../frontend/common/Login';
// import type { AuthOptions } from '../frontend/common/SocialAuthLogin';
import { useGetPageUrl } from '../framework/PageNavigation/useGetPageUrl';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformLogin() {
  // const { data: options } = useGet<AuthOptions>('/api/gateway/v1/auth/');
  const getPageUrl = useGetPageUrl();
  return <Login apiUrl="/api/gateway/v1/login/" onLoginUrl={getPageUrl(PlatformRoute.Dashboard)} />;
}
