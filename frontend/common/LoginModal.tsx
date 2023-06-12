import { Modal, ModalVariant, Stack, Title, TitleSizes } from '@patternfly/react-core';
import ky, { HTTPError } from 'ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  usePageDialog,
} from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { RouteObj } from '../Routes';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServer } from '../automation-servers/interfaces/AutomationServer';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { setCookie } from './crud/cookie';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';

const LoginModalDiv = styled.div`
  padding: 24px;
`;

export function LoginModal(props: { server?: string; onLogin?: () => void }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const navigate = useNavigate();
  const onClose = () => {
    if (process.env.EDA === 'true') {
      navigate(-1);
    }
    setDialog(undefined);
  };
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
      showClose={process.env.EDA !== 'true'}
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
        let automationServer: AutomationServer | undefined;
        if (process.env.AWX === 'true') {
          automationServer = { name: '', url: '', type: AutomationServerType.AWX };
        } else if (process.env.HUB === 'true') {
          automationServer = { name: '', url: '', type: AutomationServerType.HUB };
        } else if (process.env.EDA === 'true') {
          automationServer = { name: '', url: '', type: AutomationServerType.EDA };
        } else {
          automationServer = automationServers.find((server) => server.url === data.server);
        }
        if (!automationServer) return;

        let loginPageUrl: string;
        switch (automationServer.type) {
          case AutomationServerType.AWX:
            loginPageUrl = '/api/login/';
            break;
          case AutomationServerType.HUB:
            loginPageUrl = '/api/automation-hub/_ui/v1/auth/login/';
            break;
          case AutomationServerType.EDA:
            loginPageUrl = '/api/eda/v1/auth/session/login/';
            break;
        }
        if (!loginPageUrl) return;

        setCookie('server', data.server);
        const loginPage = await ky.get(loginPageUrl, { credentials: 'include' }).text();
        let searchString = 'name="csrfmiddlewaretoken" value="';
        if (automationServer.type === AutomationServerType.EDA) searchString = 'csrfToken: "';
        const searchStringIndex = loginPage.indexOf(searchString);
        let csrfmiddlewaretoken: string | undefined;
        if (searchStringIndex !== -1) {
          csrfmiddlewaretoken = loginPage.substring(
            searchStringIndex + searchString.length,
            loginPage.indexOf('"', searchStringIndex + searchString.length)
          );
        }
        const searchParams = new URLSearchParams();
        if (csrfmiddlewaretoken) {
          searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken);
          setCookie('csrftoken', csrfmiddlewaretoken);
        }
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
          if (!(err instanceof HTTPError)) {
            throw err;
          }
          if (err.response.status === 0) {
            // Do nothing
          } else if (err.response.status === 401 || err.response.status === 403) {
            throw new Error('Invalid username or password. Please try again.');
          } else {
            throw err;
          }
        }

        localStorage.setItem('server', data.server);
        setAutomationServer(automationServer);
        switch (automationServer.type) {
          case AutomationServerType.AWX:
            navigate(RouteObj.Dashboard);
            break;
          case AutomationServerType.EDA:
            navigate(RouteObj.EdaDashboard);
            break;
          case AutomationServerType.HUB:
            navigate(RouteObj.HubDashboard);
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
      defaultValue={
        process.env.EDA === 'true'
          ? {}
          : {
              server: automationServers.find((automationServer) =>
                props.defaultServer
                  ? automationServer.url === props.defaultServer
                  : localStorage.getItem('server')
              )?.url,
            }
      }
      disableBody
      disablePadding
      disableScrolling
    >
      {process.env.AWX !== 'true' && process.env.HUB !== 'true' && process.env.EDA !== 'true' && (
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
                : automationServer?.type === AutomationServerType.HUB
                ? t('Galaxy Ansible server')
                : automationServer?.type === AutomationServerType.EDA
                ? t('EDA server')
                : t('Unknown'),
          }))}
          isRequired
        />
      )}
      <PageFormTextInput
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
        autoFocus
        autoComplete="off"
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
