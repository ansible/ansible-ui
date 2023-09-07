import { Login } from '../common/Login';
import type { AuthOptions } from '../common/SocialAuthLogin';
import { useGet } from '../common/crud/useGet';

export function AwxLogin() {
  const { data: options } = useGet<AuthOptions>('/api/v2/auth/');

  return <Login authOptions={options} loginUrl="/api/login/" />;
}
