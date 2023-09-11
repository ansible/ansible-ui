import { Button } from '@patternfly/react-core';
import { AzureIcon, GoogleIcon, GithubIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  margin-block-start: 40px;
  padding-block-start: 20px;
  border-block-start: 1px solid var(--pf-global--BorderColor--light-100);
`;

const Heading = styled.h2`
  font-weight: var(--pf-global--FontWeight--bold);
  margin-block-end: 1em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px 50px;
`;

export type AuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

type SocialAuthLoginProps = {
  options?: AuthOptions;
};

export function SocialAuthLogin(props: SocialAuthLoginProps) {
  const { options } = props;
  const { t } = useTranslation();

  if (!options || !Object.keys(options).length) {
    return null;
  }

  return (
    <Container>
      <Heading>{t`Log in with`}</Heading>
      <Grid>
        {Object.keys(options).map((key) => (
          <SocialAuthLink key={key} authKey={key} options={options[key]} />
        ))}
      </Grid>
    </Container>
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

function SocialAuthLink(props: { authKey: string; options: { login_url: string } }) {
  const { options } = props;
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
  };

  const Icon = icons[props.authKey] ?? UserCircleIcon;

  return (
    <Button
      data-cy={`social-auth-${props.authKey}`}
      component="a"
      href={options.login_url}
      variant="secondary"
    >
      <Icon height="20" width="20" style={{ verticalAlign: '-0.25em', marginRight: '0.5em' }} />
      {labels[props.authKey] ?? ''}
    </Button>
  );
}
