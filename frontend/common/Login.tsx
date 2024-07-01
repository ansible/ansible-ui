import { LoginForm, LoginPage } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../framework/components/ErrorBoundary';
import { useFrameworkTranslations } from '../../framework/useFrameworkTranslations';
import { AuthOption, SocialAuthLogin } from './SocialAuthLogin';
import { RequestError, createRequestError } from './crud/RequestError';
import { getCookie } from './crud/cookie';

export function Login(props: {
  hideInputs?: boolean;
  authOptions?: AuthOption[];
  apiUrl: string;
  onSuccess: () => void;
  loginDescription?: string;
  icon?: string;
  brand?: string;
  product?: string;
  productDescription?: string;
}) {
  const { t } = useTranslation();
  const [translations] = useFrameworkTranslations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [helperText, setHelperText] = useState('');

  const { apiUrl } = props;
  const onSubmit = useCallback(async () => {
    try {
      const loginPageResponse = await fetch(apiUrl, {
        credentials: 'include',
        headers: { Accept: 'application/json,text/*' },
      });
      if (!loginPageResponse.ok) {
        throw await createRequestError(loginPageResponse);
      }

      const searchParams = new URLSearchParams();
      searchParams.set('username', username);
      searchParams.set('password', password);

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        ['X-Csrftoken']: getCookie('csrftoken') || '',
      };

      try {
        // We need to make a request to the login page first to get the CSRF token
        // the CSRF token is required for the login request
        // and is set as a cookie on the login page response
        const response = await fetch(apiUrl, {
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
          throw new Error(t('Invalid username or password. Please try again.'));
        } else if (err.statusCode !== 0) {
          throw err;
        }
      }

      props.onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setHelperText(err.message);
      } else {
        setHelperText(t('Invalid username or password. Please try again.'));
      }
    }
  }, [apiUrl, password, props, t, username]);

  return (
    <ErrorBoundary message={translations.errorText}>
      <LoginPage
        loginTitle={t('Log in to your account')}
        loginSubtitle={props.loginDescription}
        socialMediaLoginAriaLabel={t('Log in with social media')}
        socialMediaLoginContent={
          !props.hideInputs ? <SocialAuthLogin options={props.authOptions} /> : undefined
        }
        brandImgSrc={props.icon}
        brandImgAlt={props.product}
        textContent={props.productDescription}
      >
        <LoginForm
          showHelperText={!!helperText}
          helperText={helperText}
          helperTextIcon={<ExclamationCircleIcon />}
          usernameLabel={t('Username')}
          usernameValue={username}
          onChangeUsername={(_, username) => {
            setHelperText('');
            setUsername(username);
          }}
          isValidUsername={!helperText || !!username}
          passwordLabel={t('Password')}
          passwordValue={password}
          onChangePassword={(_, password) => {
            setHelperText('');
            setPassword(password);
          }}
          isValidPassword={!helperText || !!password}
          loginButtonLabel={t('Log in')}
          onLoginButtonClick={(event) => {
            event.preventDefault();
            if (!username) {
              setHelperText(t('Username is required'));
              return;
            }
            if (!password) {
              setHelperText(t('Password is required'));
              return;
            }
            void onSubmit();
          }}
        />
      </LoginPage>
    </ErrorBoundary>
  );
}
