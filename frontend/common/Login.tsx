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
const Logo = styled.img`
  position: absolute;
  bottom: -100px;
  right: -100px;
  width: 500px;
  height: auto;
`;

const ServiceLogo = styled.img`
  position: absolute;
  bottom: 275px;
  right: -200px;
  height: 150px;
  width: auto;
`;

const Inner = styled.div`
  max-width: 500px;
  margin: 2rem 2rem 0 auto;
  padding: 3rem 3.5rem;
  background-color: var(--pf-v5-global--BackgroundColor--100);

  .pf-v5-theme-dark & {
    background-color: var(--pf-v5-global--BackgroundColor--300);
  }
`;
const LeftHalf = styled.div`
  width: 50%;
`;

const RightHalf = styled.div`
  width: 50%;
  position: relative; /* Ensure positioning context for the logo */
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
        <LeftHalf>
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
        </LeftHalf>
        <RightHalf>
          <ServiceLogo
            src={
              process.env.PRODUCT === 'Automation Hub'
                ? '/static/media/galaxy-logo-ansibull.svg'
                : process.env.PRODUCT === 'Event Driven Automation'
                  ? '/static/media/eda-icon.svg'
                  : '/static/media/awx-logo.svg'
            }
            alt="logo"
          />
        </RightHalf>
        <Logo src="/static/media/ansible-mark.svg" alt="ansible mark" />
      </Wrapper>
    </ErrorBoundary>
  );
}
