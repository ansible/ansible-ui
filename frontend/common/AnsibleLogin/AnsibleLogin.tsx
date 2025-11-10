import { useFrameworkTranslations } from '@ansible/ansible-ui-framework';
import { ErrorBoundary } from '@ansible/ansible-ui-framework/components/ErrorBoundary';
import {
  BackgroundImage,
  Brand,
  Icon,
  Login,
  LoginFooter as PFLoginFooter,
  LoginForm,
  LoginHeader,
  LoginMainBody,
  LoginMainFooter,
  LoginMainHeader,
  Stack,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styled from 'styled-components';
import { getCookie } from '../crud/cookie';
import { createRequestError, RequestError } from '../crud/RequestError';
import { AuthOption, SocialAuthLogin } from '../SocialAuthLogin';
import { validateUrlPath } from './validateUrlPath';

const LoginFooter = styled(PFLoginFooter)`
  color: var(--pf-t--color--white);

  a {
    color: var(--pf-t--color--blue--20);
  }
`;

export function AnsibleLogin(props: {
  //** Url for external authentication service where users will login if login_redirect_override is set */
  externalLoginUrl?: string;

  /** Title for the login main body header of the login page */
  loginTitle?: string;

  /** Subtitle for the login main body header of the login page */
  loginSubtitle?: string;

  /** The brand image for the login page */
  brandImg?: ReactNode;

  /** Attribute that specifies the alt text of the brand image for the login page */
  brandImgAlt: string;

  /** Content rendered inside of the text component of the login page */
  textContent?: string;

  /** Content rendered inside of social media login footer section */
  authOptions?: AuthOption[];

  /** Attribute that specifies the URL of the login page */
  showLoginForm: boolean;

  /** Attribute that specifies the URL of the background image for the login page */
  backgroundImgSrc?: string;

  /** The url to the API endpoint for logging in */
  loginApiUrl: string;

  /** Callback function that is called when the user successfully logs in */
  onSuccess: () => void;

  otherOptions?: { label: string; onClick: () => void }[];
}) {
  const { t } = useTranslation();
  const [translations] = useFrameworkTranslations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [helperText, setHelperText] = useState<ReactNode>('');
  const [socialAuthErrorText, setSocialAuthErrorText] = useState<ReactNode>('');
  const location = useLocation();

  const { loginApiUrl } = props;
  const queryParams = new URLSearchParams(location.search);
  const nextPath = validateUrlPath(queryParams.get('next'));
  const onSubmit = useCallback(async () => {
    try {
      const loginPageResponse = await fetch(loginApiUrl, {
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
        const response = await fetch(loginApiUrl, {
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
        if (err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 403) {
          throw new Error(t('Invalid username or password. Please try again.'));
        } else if (err.statusCode !== 0) {
          throw err;
        }
      }

      if (nextPath) {
        window.location.href = nextPath;
      } else if (location.pathname.includes('/login')) {
        window.location.href = '/';
      } else {
        props.onSuccess?.();
      }
    } catch (err) {
      if (err instanceof Error) {
        setHelperText(<ErrorSpanStyled>{err.message}</ErrorSpanStyled>);
      } else {
        setHelperText(
          <ErrorSpanStyled>{t('Invalid username or password. Please try again.')}</ErrorSpanStyled>
        );
      }
    }
  }, [loginApiUrl, password, props, t, username, nextPath, location.pathname]);

  const hasAuthFailedFlag = location.search.includes('auth_failed');
  useEffect(() => {
    if (hasAuthFailedFlag) {
      setSocialAuthErrorText(
        <>
          <ErrorExclamationCircleIconStyled style={{ marginRight: '5px' }} />
          <ErrorSpanStyled>{t('Unable to complete social auth login')}</ErrorSpanStyled>
        </>
      );
    }
  }, [hasAuthFailedFlag, t]);

  useEffect(() => {
    const passwordInput = document.getElementById('pf-login-password-id');
    const usernameInput = document.getElementById('pf-login-username-id');

    if (passwordInput) {
      passwordInput.setAttribute('autocomplete', 'new-password');
    }
    if (usernameInput) {
      usernameInput.setAttribute('autocomplete', 'off');
    }
  }, []);
  if (props.externalLoginUrl && !location.pathname.includes('/login')) {
    window.location.replace(props.externalLoginUrl);
    return null;
  }
  // Need to use component version of PatternFly's LoginPage
  // because we need to be able to use a component for the brand image
  // SEE: https://github.com/patternfly/patternfly-react/blob/main/packages/react-core/src/components/LoginPage/LoginPage.tsx
  return (
    <ErrorBoundary message={translations.errorText}>
      {props.backgroundImgSrc && <BackgroundImage src={props.backgroundImgSrc} />}
      <Login
        header={
          <LoginHeader
            headerBrand={
              typeof props.brandImg === 'string' ? (
                <Brand src={props.brandImg} alt={props.brandImgAlt} />
              ) : (
                <BrandStyled>{props.brandImg}</BrandStyled>
              )
            }
          />
        }
        footer={
          props.textContent && (
            <LoginFooter
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(props.textContent || ''),
              }}
            />
          )
        }
      >
        <LoginMainHeader
          title={props.loginTitle ?? t('Log in to your account')}
          subtitle={props.showLoginForm ? props.loginSubtitle : undefined}
        />
        {props.showLoginForm && (
          <LoginMainBody>
            <LoginForm
              showHelperText={!!helperText}
              helperText={helperText}
              helperTextIcon={
                <Icon status="danger">
                  <ErrorExclamationCircleIconStyled />
                </Icon>
              }
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
              isShowPasswordEnabled
              showPasswordAriaLabel={t('Show password')}
              hidePasswordAriaLabel={t('Hide password')}
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
          </LoginMainBody>
        )}
        {props.authOptions && (
          <LoginMainFooter
            socialMediaLoginContent={
              props.authOptions ? (
                <SocialAuthLogin helperText={socialAuthErrorText} options={props.authOptions} />
              ) : undefined
            }
            socialMediaLoginAriaLabel={t('Log in with authentication provider')}
          />
        )}
        {props.otherOptions && (
          <LoginMainFooter
            socialMediaLoginContent={
              <Stack hasGutter style={{ width: '100%' }}>
                {props.otherOptions?.map((option) => (
                  <Link key={option.label} to="#" onClick={option.onClick}>
                    {option.label}
                  </Link>
                ))}
              </Stack>
            }
            socialMediaLoginAriaLabel={t('Log in with authentication provider')}
          />
        )}
      </Login>
    </ErrorBoundary>
  );
}

const ErrorSpanStyled = styled.span`
  color: var(--pf-t--global--text--color--status--danger--default);
`;

const ErrorExclamationCircleIconStyled = styled(ExclamationCircleIcon)`
  color: var(--pf-t--global--icon--color--status--danger--default);
`;

const BrandStyled = styled.div`
  margin-bottom: 16px;
`;
