import { Page, PageSection, Title } from '@patternfly/react-core';
import ky, { HTTPError } from 'ky';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  useBreakpoint,
} from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { useAutomationServers } from '../automation-servers/AutomationServerProvider';
import { setCookie } from '../Data';
import { RouteE } from '../Routes';

export default function Login() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { automationServers, setAutomationServer } = useAutomationServers();

  const [searchParams] = useSearchParams();

  // const addAutomationHost = useAddAutomationServer()

  const { cache } = useSWRConfig();
  useEffect(() => {
    (cache as unknown as { clear: () => void }).clear?.();
  }, [cache]);

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
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('Invalid username or password. Please try again.'));
        }
      }
    },
    [automationServers, navigate, setAutomationServer, t]
  );

  const sm = useBreakpoint('sm');
  const md = useBreakpoint('md');

  const padding = md ? 48 : sm ? 32 : 16;

  return (
    <Page style={{ backgroundColor: sm ? '#222' : 'white' }}>
      <PageSection
        variant="light"
        padding={{ default: 'noPadding' }}
        style={{
          width: 500,
          maxWidth: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: sm ? 'auto' : undefined,
          marginBottom: sm ? 'auto' : undefined,
          padding,
        }}
        isFilled={!sm}
      >
        <Title headingLevel="h2">{t('Welcome to the')}</Title>
        <Title headingLevel="h1" style={{ paddingTop: 8, paddingBottom: 24 }}>
          {t('Ansible Automation Platform')}
        </Title>
        <PageForm
          submitText={t('Log In')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          isVertical
          singleColumn
          defaultValue={{
            server: searchParams.get('server') ?? localStorage.getItem('server') ?? '',
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
              group:
                host.type === 'controller' ? t('Automation controllers') : t('Automation hubs'),
            }))}
            isRequired
          />
          <PageFormTextInput
            name="username"
            label={t('Username')}
            placeholder={t('Enter username')}
            isRequired
          />
          <PageFormTextInput
            name="password"
            label={t('Password')}
            placeholder={t('Enter password')}
            type="password"
            isRequired
          />
        </PageForm>
      </PageSection>
    </Page>
  );
}
