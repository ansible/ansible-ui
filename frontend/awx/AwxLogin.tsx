import { useGetPageUrl } from '../../framework/PageNavigation/useGetPageUrl';
import { Login } from '../common/Login';
import type { AuthOptions } from '../common/SocialAuthLogin';
import { useGet } from '../common/crud/useGet';
import { AwxRoute } from './AwxRoutes';

export function AwxLogin() {
  const { data: options } = useGet<AuthOptions>('/api/v2/auth/');
  const getPageUrl = useGetPageUrl();
  return (
    <Login authOptions={options} apiUrl="/api/login/" onLoginUrl={getPageUrl(AwxRoute.Login)} />
  );
}
