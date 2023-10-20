import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, TitleSizes } from '@patternfly/react-core';
import background from '../../node_modules/@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import { LoginForm } from './LoginForm';
import type { AuthOptions } from './SocialAuthLogin';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Wrapper = styled.div`
  min-height: 100dvh;
  padding-block: 50px;
  background-color: #444;
  background-image: url(${background});
  background-position: center;
  background-size: cover;
`;

const Inner = styled.div`
  max-inline-size: 550px;
  margin-inline: auto;
  padding: 3.5rem;
  background-color: var(--pf-v5-global--BackgroundColor--100);

  .pf-v5-theme-dark & {
    background-color: var(--pf-v5-global--BackgroundColor--300);
  }
`;

const Heading = styled(Title)`
  margin-block-end: 2.5rem;
`;

type LoginProps = {
  authOptions?: AuthOptions;
  apiUrl?: string;
  onLoginUrl?: string;
};

export function Login(props: LoginProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigateBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const productName = process.env.PRODUCT ?? 'Ansible';

  return (
    <Wrapper>
      <Inner>
        <Heading headingLevel="h1" size={TitleSizes['2xl']}>
          {t('Welcome to {{productName}}', { productName })}
        </Heading>
        <LoginForm
          apiUrl={props.apiUrl}
          authOptions={props.authOptions}
          onLoginUrl={props.onLoginUrl}
          onLogin={navigateBack}
        />
      </Inner>
    </Wrapper>
  );
}
