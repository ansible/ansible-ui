import { useGetPageUrl } from '../../framework/PageNavigation/useGetPageUrl';
import { Login } from '../common/Login';
import type { AuthOption } from '../common/SocialAuthLogin';
import { useGet } from '../common/crud/useGet';
import { AwxRoute } from './AwxRoutes';
import { awxAPI } from './api/awx-utils';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin() {
  const { data: options } = useGet<AwxAuthOptions>(awxAPI`/auth/`);
  const getPageUrl = useGetPageUrl();

  const authOptions: AuthOption[] = [];
  if (options) {
    Object.keys(options).forEach((key) => {
      authOptions.push({
        login_url: options[key].login_url,
        type: key,
      });
    });
  }

  return (
    <Login authOptions={authOptions} apiUrl="/api/login/" onLoginUrl={getPageUrl(AwxRoute.Login)} />
  );
}
