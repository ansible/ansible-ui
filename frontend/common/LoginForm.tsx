import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionGroup } from '@patternfly/react-core';
import {
  GenericForm,
  PageFormSubmitHandler,
  PageFormSubmitButton,
  PageFormTextInput,
  usePageNavigate,
} from '../../framework';
import { hubAPI } from '../hub/api/utils';
import { AwxRoute } from '../awx/AwxRoutes';
import { EdaRoute } from '../eda/EdaRoutes';
import { HubRoute } from '../hub/HubRoutes';
import { RequestError, createRequestError } from './crud/RequestError';
import { setCookie } from './crud/cookie';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';
import { AuthOption, SocialAuthLogin } from './SocialAuthLogin';

type LoginFormProps = {
  apiUrl?: string;
  authOptions?: AuthOption[];
  onLoginUrl?: string;
  onLogin?: () => void;
};

export function LoginForm(props: LoginFormProps) {
  const { authOptions } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

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
          if (err.statusCode === 401 || err.statusCode === 403) {
            throw new Error('Invalid username or password. Please try again.');
          } else if (err.statusCode !== 0) {
            throw err;
          }
        }

        if (props.onLoginUrl) {
          navigate(props.onLoginUrl);
        }
        switch (process.env.UI_MODE) {
          case 'AWX':
            pageNavigate(AwxRoute.Dashboard);
            break;
          case 'EDA':
            pageNavigate(EdaRoute.Dashboard);
            break;
          case 'HUB':
          case 'GALAXY':
            pageNavigate(HubRoute.Dashboard);
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
    [pageNavigate, navigate, props, t]
  );

  return (
    <GenericForm onSubmit={onSubmit}>
      <PageFormTextInput
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        autoComplete={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
        isRequired
        autoFocus
      />
      <PageFormTextInput
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        autoComplete={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
        isRequired
      />
      <ActionGroup>
        <PageFormSubmitButton>{t('Log in')}</PageFormSubmitButton>
      </ActionGroup>
      <SocialAuthLogin options={authOptions} />
    </GenericForm>
  );
}
