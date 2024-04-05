import { Title, TitleSizes } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ErrorBoundary } from '../../framework/components/ErrorBoundary';
import { useFrameworkTranslations } from '../../framework/useFrameworkTranslations';
import background from '../../node_modules/@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import { LoginForm } from './LoginForm';
import type { AuthOption } from './SocialAuthLogin';

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
  padding: 3rem 3.5rem;
  background-color: var(--pf-v5-global--BackgroundColor--100);

  .pf-v5-theme-dark & {
    background-color: var(--pf-v5-global--BackgroundColor--300);
  }
`;

const Heading = styled(Title)`
  margin-block-end: 2.5rem;
`;

type LoginProps = {
  hideInputs?: boolean;
  authOptions?: AuthOption[];
  apiUrl: string;
  onSuccess: () => void;
};

export function Login(props: LoginProps) {
  const { t } = useTranslation();
  const productName = process.env.PRODUCT ?? 'Ansible';
  const [translations] = useFrameworkTranslations();
  return (
    <ErrorBoundary message={translations.errorText}>
      <Wrapper>
        <Inner>
          <Heading headingLevel="h1" size={TitleSizes['2xl']}>
            {t('Welcome to {{productName}}', { productName })}
          </Heading>
          <LoginForm
            apiUrl={props.apiUrl}
            authOptions={props.authOptions}
            onSuccess={props.onSuccess}
            hideInputs={props.hideInputs}
          />
        </Inner>
      </Wrapper>
    </ErrorBoundary>
  );
}
