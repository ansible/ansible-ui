import { Button as PFButton, Stack } from '@patternfly/react-core';
import { AzureIcon, GithubIcon, GoogleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { validateUrlPath } from './AnsibleLogin/validateUrlPath';

const Button = styled(PFButton)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export type AuthOption = {
  name?: string;
  login_url: string;
  type: string;
};

type SocialAuthLoginProps = {
  options?: AuthOption[];
  helperText?: React.ReactNode;
};

export function SocialAuthLogin(props: SocialAuthLoginProps) {
  const { options, helperText } = props;
  const { t } = useTranslation();

  if (!options || !Object.keys(options).length) {
    return null;
  }

  return (
    <>
      <Stack style={{ width: '100%' }} hasGutter>
        {t('Log in with:')}
        {helperText && (
          <div data-cy={'social-error'} data-testid={'social-error'}>
            {helperText}
          </div>
        )}
        {options.map((option) => (
          <SocialAuthLink key={option.login_url} option={option} />
        ))}
      </Stack>
    </>
  );
}

const icons: { [key: string]: typeof GithubIcon } = {
  'azuread-oauth2': AzureIcon,
  github: GithubIcon,
  'github-org': GithubIcon,
  'github-team': GithubIcon,
  'github-enterprise': GithubIcon,
  'github-enterprise-org': GithubIcon,
  'github-enterprise-team': GithubIcon,
  'google-oauth2': GoogleIcon,
  oidc: UserCircleIcon,
  saml: UserCircleIcon,
};

function SocialAuthLink(props: { option: AuthOption }) {
  const { option } = props;
  const { t } = useTranslation();

  const labels: { [key: string]: string } = {
    'azuread-oauth2': t('Azure AD'),
    github: t('GitHub'),
    'github-org': t('GitHub Organizations'),
    'github-team': t('Github Teams'),
    'github-enterprise': t('GitHub Enterprise'),
    'github-enterprise-org': t('GitHub Enterprise Organizations'),
    'github-enterprise-team': t('GitHub Enterprise Teams'),
    'google-oauth2': t('Google'),
    oidc: t('OIDC'),
    saml: t('SAML'),
    'saml:keycloak': t('SAML Keycloak'),
  };

  const Icon = icons[option.type] ?? UserCircleIcon;

  const handleSocialAuthClick = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const nextParam = queryParams.get('next');

    let redirectUrl: string | null = null;

    if (nextParam) {
      redirectUrl = validateUrlPath(nextParam);
    }

    if (!redirectUrl && window.location.pathname !== '/login') {
      redirectUrl = window.location.pathname + window.location.search;
    }

    if (redirectUrl) {
      sessionStorage.setItem('social_auth_redirect_url', redirectUrl);
    }
  };

  return (
    <Button
      data-cy={`social-auth-${option.type}`}
      data-testid={`social-auth-${option.type}`}
      component="a"
      href={option.login_url}
      variant="secondary"
      icon={<Icon />}
      onClick={handleSocialAuthClick}
    >
      {option.name || labels[option.type] || ''}
    </Button>
  );
}
