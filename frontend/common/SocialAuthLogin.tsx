import { LoginMainFooter, Button } from '@patternfly/react-core';
import { GithubIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useGet } from '../common/crud/useGet';
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

type AuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function SocialAuthLogin() {
  const { data: options } = useGet<AuthOptions>('/api/v2/auth/');
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

function SocialAuthLink(props: { authKey: string; options: { login_url: string } }) {
  const { options } = props;
  const { t } = useTranslation();

  return (
    <Button data-cy="social-auth-github" component="a" href={options.login_url} variant="secondary">
      <GithubIcon
        height="20"
        width="20"
        style={{ verticalAlign: '-0.25em', marginRight: '0.5em' }}
      />
      {t`GitHub`}
    </Button>
  );
}
