import { Page } from '@patternfly/react-core';
import useSWR, { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import ProductIcon from './awx-logo.svg';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: { children: React.ReactNode }) {
  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      authOptions.push({ login_url: options[key].login_url, type: key });
    });
  }

  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();

  if (activeAwxUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeAwxUser) {
    return (
      <Login
        authOptions={authOptions}
        apiUrl="/api/login/"
        onSuccess={() => {
          refreshActiveAwxUser?.();
          void mutate(() => true);
        }}
        icon={<ProductIcon style={{ height: 64 }} />}
        brand={process.env.BRAND}
        product={process.env.PRODUCT}
      />
    );
  }

  return (
    <WebSocketProvider>
      <AwxConfigProvider>{props.children}</AwxConfigProvider>
    </WebSocketProvider>
  );
}
