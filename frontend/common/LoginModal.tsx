import { Modal, ModalVariant, Stack, Title, TitleSizes } from '@patternfly/react-core';
import ky, { HTTPError } from 'ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageForm, PageFormSelect, PageFormSubmitHandler, usePageDialog } from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { LoadingState } from '../../framework/components/LoadingState';
import { RouteObj } from '../Routes';
import { AutomationServerType } from '../automation-servers/AutomationServer';
import { useAutomationServers } from '../automation-servers/AutomationServersProvider';
import { useSetActiveAutomationServer } from '../automation-servers/hooks/useSetActiveAutomationServer';
import { setCookie } from './crud/cookie';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';

const LoginModalDiv = styled.div`
  padding: 24px;
`;

export function LoginModal(props: { serverId?: string | number; onLogin?: () => void }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const navigate = useNavigate();
  const onClose = () => {
    if (process.env.UI_MODE === 'EDA') {
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
      title={t('Login')}
      aria-label={t('Login')}
      onClose={onClose}
      showClose={!process.env.UI_MODE}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <LoginModalDiv>
        <LoginForm defaultServerId={props.serverId} onLogin={props.onLogin} />
      </LoginModalDiv>
    </Modal>
  );
}

export function useLoginModal(onLogin?: () => void) {
  const [_, setDialog] = usePageDialog();
  const onLoginHandler = useCallback(() => onLogin?.(), [onLogin]);
  return useCallback(
    (serverId?: string | number) =>
      setDialog(
        <LoginModal
          serverId={serverId}
          onLogin={() => {
            setDialog(undefined);
            onLoginHandler();
          }}
        />
      ),
    [onLoginHandler, setDialog]
  );
}

function LoginForm(props: { defaultServerId?: string | number; onLogin?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const automationServers = useAutomationServers();
  const setActiveAutomationServer = useSetActiveAutomationServer();

  useInvalidateCacheOnUnmount();

  const onSubmit = useCallback<
    PageFormSubmitHandler<{ serverId: string | number; username: string; password: string }>
  >(
    async (data, setError) => {
      try {
        const automationServer = automationServers?.find(
          (automationServer) => automationServer.id === data.serverId
        );
        if (!automationServer) return;

        console.log(automationServer);

        setActiveAutomationServer?.(automationServer);
        setCookie('server', automationServer.url);

        let loginPageUrl: string;
        switch (automationServer.type) {
          case AutomationServerType.AWX:
            loginPageUrl = '/api/login/';
            break;
          case AutomationServerType.EDA:
            loginPageUrl = '/api/eda/v1/auth/session/login/';
            break;
          case AutomationServerType.Galaxy:
            loginPageUrl = `/api/galaxy/_ui/v1/auth/login/`;
            break;
          case AutomationServerType.HUB:
            loginPageUrl = `/api/automation-hub/_ui/v1/auth/login/`;
            break;
        }
        if (!loginPageUrl) return;

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

        switch (automationServer.type) {
          case AutomationServerType.AWX:
            navigate(RouteObj.Dashboard);
            break;
          case AutomationServerType.EDA:
            navigate(RouteObj.EdaDashboard);
            break;
          case AutomationServerType.HUB:
          case AutomationServerType.Galaxy:
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
    [automationServers, navigate, props, setActiveAutomationServer, t]
  );
  if (!automationServers) return <LoadingState />;

  return (
    <PageForm
      submitText={t('Log in')}
      onSubmit={onSubmit}
      cancelText={t('Cancel')}
      isVertical
      singleColumn
      defaultValue={
        process.env.UI_MODE
          ? {}
          : {
              serverId: automationServers?.find((automationServer) =>
                props.defaultServerId
                  ? automationServer.id === props.defaultServerId
                  : automationServer.isActive
              )?.id,
            }
      }
      disableBody
      disablePadding
      disableScrolling
    >
      {!process.env.UI_MODE && (
        <PageFormSelect
          name="serverId"
          label={t('Automation server')}
          placeholderText={t('Select automation server')}
          options={(automationServers ?? []).map((automationServer) => ({
            label: automationServer.name,
            description: automationServer.url,
            value: automationServer.id,
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
