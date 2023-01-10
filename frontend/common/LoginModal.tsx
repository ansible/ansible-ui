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
import { setCookie } from '../Data';
import { RouteE } from '../Routes';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';
export function LoginModal(props: { server?: string; onLogin?: () => void }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  return (
    <Modal
      header={
        <Stack style={{ paddingBottom: 8 }}>
          {t('Welcome to the')}
          <Title headingLevel="h1" size={TitleSizes['2xl']}>
            {t('Ansible Automation Platform')}
          </Title>
        </Stack>
      }
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <div style={{ padding: 24 }}>
        <LoginForm defaultServer={props.server} onLogin={props.onLogin} />
      </div>
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
          automationServer.type === 'controller'
            ? '/api/login/'
            : automationServer.type === 'hub'
            ? '/api/automation-hub/_ui/v1/auth/login/'
            : undefined;

        if (loginPageUrl !== undefined) {
          setCookie('server', data.server);
          let loginPage = await ky.get(loginPageUrl, { credentials: 'include' }).text();
          loginPage = loginPage.substring(loginPage.indexOf('csrfToken: '));
          loginPage = loginPage.substring(loginPage.indexOf('"') + 1);
          const csrfmiddlewaretoken = loginPage.substring(0, loginPage.indexOf('"'));

          const searchParams = new URLSearchParams();
          searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken);
          searchParams.set('username', data.username);
          searchParams.set('password', data.password);

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
          case 'eda':
            setCookie('server', data.server);
            navigate(RouteE.EdaProjects);
            break;
          case 'hub':
            navigate(RouteE.HubDashboard);
            break;
          default:
            navigate(RouteE.Dashboard);
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
      submitText={t('Log In')}
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
        options={automationServers.map((host) => ({
          label: host.name,
          description: host.url,
          value: host.url,
          group: host.type === 'controller' ? t('Automation controllers') : t('Automation hubs'),
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
