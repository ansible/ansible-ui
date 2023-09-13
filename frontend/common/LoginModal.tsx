import { Modal, ModalVariant, Stack, Title, TitleSizes } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageForm, PageFormSubmitHandler, usePageDialog } from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { hubAPI } from '../hub/api/utils';
import { RouteObj } from './Routes';
import { AuthOptions, SocialAuthLogin } from './SocialAuthLogin';
import { RequestError, createRequestError } from './crud/RequestError';
import { setCookie } from './crud/cookie';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';

const LoginModalDiv = styled.div`
  padding: 24px;
`;

type LoginModalProps = {
  authOptions?: AuthOptions;
  apiUrl?: string;
  onLoginUrl?: string;
  onLogin?: () => void;
};

export function LoginModal(props: LoginModalProps) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const navigate = useNavigate();
  const onClose = () => {
    if (process.env.UI_MODE === 'EDA') {
      navigate(-1);
    }
    setDialog(undefined);
  };
  return (
    <Modal
      header={
        <Stack style={{ paddingBottom: 8 }}>
          {t('Welcome to')}
          <Title headingLevel="h1" size={TitleSizes['2xl']}>
            {process.env.PRODUCT ?? t('Ansible')}
          </Title>
        </Stack>
      }
      isOpen
      title={t('Login')}
      aria-label={t('Login')}
      onClose={onClose}
      showClose={!process.env.UI_MODE}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <LoginModalDiv>
        <LoginForm
          apiUrl={props.apiUrl}
          authOptions={props.authOptions}
          onLoginUrl={props.onLoginUrl}
          onLogin={props.onLogin}
        />
      </LoginModalDiv>
    </Modal>
  );
}

export function useLoginModal(args: {
  authOptions?: AuthOptions;
  apiUrl?: string;
  onLoginUrl?: string;
  onLogin?: () => void;
}) {
  const { authOptions, apiUrl, onLoginUrl, onLogin } = args;
  const [_, setDialog] = usePageDialog();
  const onLoginHandler = useCallback(() => onLogin?.(), [onLogin]);
  return useCallback(
    () =>
      setDialog(
        <LoginModal
          authOptions={authOptions}
          apiUrl={apiUrl}
          onLoginUrl={onLoginUrl}
          onLogin={() => {
            setDialog(undefined);
            onLoginHandler();
          }}
        />
      ),
    [onLoginHandler, setDialog, authOptions, apiUrl, onLoginUrl]
  );
}

type LoginFormProps = {
  apiUrl?: string;
  authOptions?: AuthOptions;
  onLoginUrl?: string;
  onLogin?: () => void;
};

function LoginForm(props: LoginFormProps) {
  const { authOptions } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  useInvalidateCacheOnUnmount();

  const onSubmit = useCallback<
    PageFormSubmitHandler<{ serverId: string | number; username: string; password: string }>
  >(
    async (data, setError) => {
      try {
        let loginPageUrl = props.apiUrl;
        let searchString = 'name="csrfmiddlewaretoken" value="';

        if (!loginPageUrl) {
          // This is the "old" way to determine the url; leaving this here until
          // all apps are updated to pass in the url via prop
          switch (process.env.UI_MODE) {
            case 'AWX':
              loginPageUrl = '/api/login/';
              break;
            case 'EDA':
              loginPageUrl = '/api/eda/v1/auth/session/login/';
              searchString = 'csrfToken: "';
              break;
            case 'GALAXY':
            case 'HUB':
              loginPageUrl = hubAPI`/_ui/v1/auth/login/`;
              break;
          }
        }

        if (!loginPageUrl) return;

        const loginPageResponse = await fetch(loginPageUrl, {
          credentials: 'include',
          headers: {
            Accept: 'text/*',
          },
        });
        if (!loginPageResponse.ok) {
          throw await createRequestError(loginPageResponse);
        }
        const loginPage = await loginPageResponse.text();
        const searchStringIndex = loginPage.indexOf(searchString);
        let csrfmiddlewaretoken: string | undefined;
        if (searchStringIndex !== -1) {
          csrfmiddlewaretoken = loginPage.substring(
            searchStringIndex + searchString.length,
            loginPage.indexOf('"', searchStringIndex + searchString.length)
          );
        }

        const searchParams = new URLSearchParams();
        if (csrfmiddlewaretoken) {
          searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken);
          setCookie('csrftoken', csrfmiddlewaretoken);
        }
        searchParams.set('username', data.username);
        searchParams.set('password', data.password);
        searchParams.set('next', '/');

        try {
          const response = await fetch(loginPageUrl, {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: searchParams,
            redirect: 'manual',
          });
          if (!response.ok) {
            throw await createRequestError(response);
          }
        } catch (err) {
          if (!(err instanceof RequestError)) {
            throw err;
          }
          if (err.statusCode === 0) {
            // Do nothing
          } else if (err.statusCode === 401 || err.statusCode === 403) {
            throw new Error('Invalid username or password. Please try again.');
          } else {
            throw err;
          }
        }

        if (props.onLoginUrl) {
          navigate(props.onLoginUrl);
        }
        switch (process.env.UI_MODE) {
          case 'AWX':
            navigate(RouteObj.Dashboard);
            break;
          case 'EDA':
            navigate(RouteObj.EdaDashboard);
            break;
          case 'HUB':
          case 'GALAXY':
            navigate(RouteObj.HubDashboard);
            break;
        }

        props.onLogin?.();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('Invalid username or password. Please try again.'));
        }
      }
    },
    [navigate, props, t]
  );

  return (
    <div>
      <PageForm
        submitText={t('Log in')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        isVertical
        singleColumn
        disableBody
        disablePadding
        disableScrolling
        autoComplete={'off'}
      >
        <PageFormTextInput
          name="username"
          label={t('Username')}
          placeholder={t('Enter username')}
          isRequired
          autoFocus
          autoComplete="off"
        />
        <PageFormTextInput
          name="password"
          label={t('Password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired
          autoComplete="off"
        />
      </PageForm>
      <SocialAuthLogin options={authOptions} />
    </div>
  );
}
