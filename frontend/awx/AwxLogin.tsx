import { Login } from '../common/Login';
import type { AuthOptions } from '../common/SocialAuthLogin';
import { useGet } from '../common/crud/useGet';
import { AwxRoute } from './AwxRoutes';
import { useGetAwxUrl } from './useAwxNavigate';

export function AwxLogin() {
  const { data: options } = useGet<AuthOptions>('/api/v2/auth/');
  const getAwxUrl = useGetAwxUrl();
  return (
    <Login authOptions={options} apiUrl="/api/login/" onLoginUrl={getAwxUrl(AwxRoute.Login)} />
  );
}
