import { Modal, ModalVariant, Stack, Title, TitleSizes } from '@patternfly/react-core';
import ky, { HTTPError } from 'ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  usePageDialog,
} from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { setCookie } from '../Data';
import { RouteObj } from '../Routes';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';
import styled from 'styled-components';

const LoginModalDiv = styled.div`
  padding: 24px;
`;

export function LoginModal(props: { server?: string; onLogin?: () => void }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  return (
    <Modal
      header={
        <Stack style={{ paddingBottom: 8 }}>
          {t('Welcome to')}
          <Title headingLevel="h1" size={TitleSizes['2xl']}>
            {process.env.PRODUCT ?? t('Ansible')}
          </Title>
        </Stack>
      }
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <LoginModalDiv>
        <LoginForm defaultServer={props.server} onLogin={props.onLogin} />
      </LoginModalDiv>
    </Modal>
  );
}

export function useLoginModal(onLogin?: () => void) {
  const [_, setDialog] = usePageDialog();
  const onLoginHandler = useCallback(() => onLogin?.(), [onLogin]);
  return useCallback(
    (server?: string) =>
      setDialog(
        <LoginModal
          server={server}
          onLogin={() => {
            setDialog(undefined);
            onLoginHandler();
          }}
        />
      ),
    [onLoginHandler, setDialog]
  );
}

function LoginForm(props: { defaultServer?: string; onLogin?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { automationServers, setAutomationServer } = useAutomationServers();

  useInvalidateCacheOnUnmount();

  const onSubmit = useCallback<
    PageFormSubmitHandler<{ server: string; username: string; password: string }>
  >(
    async (data, setError) => {
      try {
        const automationServer = automationServers.find((server) => server.url === data.server);
        if (!automationServer) return;
        const loginPageUrl =
          automationServer.type === AutomationServerType.AWX
            ? '/api/login/'
            : automationServer.type === AutomationServerType.Galaxy
            ? '/api/automation-hub/_ui/v1/auth/login/'
            : '/api/eda/v1/auth/login/';

        if (loginPageUrl !== undefined) {
          setCookie('server', data.server);
          const loginPage = await ky.get(loginPageUrl, { credentials: 'include' }).text();
          let csrfmiddlewaretoken: string;
          if (loginPage.includes('csrfmiddlewaretoken')) {
            let loginPage2 = loginPage.substring(loginPage.indexOf('csrfmiddlewaretoken'));
            loginPage2 = loginPage2.substring(loginPage2.indexOf('value=') + 7);
            csrfmiddlewaretoken = loginPage2.substring(0, loginPage2.indexOf('"'));
          } else {
            let loginPage2 = loginPage.substring(loginPage.indexOf('csrfToken: '));
            loginPage2 = loginPage2.substring(loginPage2.indexOf('"') + 1);
            csrfmiddlewaretoken = loginPage2.substring(0, loginPage2.indexOf('"'));
          }

          const searchParams = new URLSearchParams();
          searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken);
          searchParams.set('username', data.username);
          searchParams.set('password', data.password);
          searchParams.set('next', '/');

          try {
            await ky.post(loginPageUrl, {
              credentials: 'include',
              body: searchParams,
              redirect: 'manual',
            });
          } catch (err) {
            if (err instanceof HTTPError && err.response.status === 0) {
              // Do nothing
            } else {
              throw err;
            }
          }
        }

        localStorage.setItem('server', data.server);
        setAutomationServer(automationServer);
        switch (automationServer.type) {
          case AutomationServerType.EDA:
            setCookie('server', data.server);
            navigate(RouteObj.EdaProjects);
            break;
          case AutomationServerType.Galaxy:
            navigate(RouteObj.HubDashboard);
            break;
          default:
            navigate(RouteObj.Dashboard);
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
    [automationServers, navigate, props, setAutomationServer, t]
  );

  return (
    <PageForm
      submitText={t('Log in')}
      onSubmit={onSubmit}
      cancelText={t('Cancel')}
      isVertical
      singleColumn
      defaultValue={{
        server: automationServers.find((automationServer) =>
          props.defaultServer
            ? automationServer.url === props.defaultServer
            : localStorage.getItem('server')
        )?.url,
      }}
      disableBody
      disablePadding
      disableScrolling
    >
      <PageFormSelectOption
        name="server"
        label={t('Automation server')}
        placeholderText={t('Select automation server')}
        options={automationServers.map((automationServer) => ({
          label: automationServer.name,
          description: automationServer.url,
          value: automationServer.url,
          group:
            automationServer?.type === AutomationServerType.AWX
              ? t('AWX Ansible server')
              : automationServer?.type === AutomationServerType.Galaxy
              ? t('Galaxy Ansible server')
              : automationServer?.type === AutomationServerType.EDA
              ? t('EDA server')
              : t('Unknown'),
        }))}
        isRequired
      />
      <PageFormTextInput
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
        autoFocus
      />
      <PageFormTextInput
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        isRequired
      />
    </PageForm>
  );
}
