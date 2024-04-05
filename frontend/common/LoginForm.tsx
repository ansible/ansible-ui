import { ActionGroup } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GenericForm,
  PageFormSubmitButton,
  PageFormSubmitHandler,
  PageFormTextInput,
} from '../../framework';
import { AuthOption, SocialAuthLogin } from './SocialAuthLogin';
import { RequestError, createRequestError } from './crud/RequestError';
import { getCookie } from './crud/cookie';

type LoginFormProps = {
  apiUrl: string;
  authOptions?: AuthOption[];
  onSuccess: () => void;
  hideInputs?: boolean;
};

export function LoginForm(props: LoginFormProps) {
  const { authOptions } = props;
  const { t } = useTranslation();

  const onSubmit = useCallback<
    PageFormSubmitHandler<{ serverId: string | number; username: string; password: string }>
  >(
    async (data, setError) => {
      try {
        if (!props.apiUrl) return;

        const loginPageResponse = await fetch(props.apiUrl, {
          credentials: 'include',
          headers: { Accept: 'text/*' },
        });
        if (!loginPageResponse.ok) {
          throw await createRequestError(loginPageResponse);
        }

        const searchParams = new URLSearchParams();
        searchParams.set('username', data.username);
        searchParams.set('password', data.password);

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          ['X-Csrftoken']: getCookie('csrftoken') || '',
        };

        try {
          // We need to make a request to the login page first to get the CSRF token
          // the CSRF token is required for the login request
          // and is set as a cookie on the login page response
          const response = await fetch(props.apiUrl, {
            credentials: 'include',
            method: 'POST',
            headers,
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

        props.onSuccess?.();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('Invalid username or password. Please try again.'));
        }
      }
    },
    [props, t]
  );

  if (props.hideInputs) {
    return <SocialAuthLogin options={authOptions} />;
  }

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
