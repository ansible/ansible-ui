import { Page, PageSection, Title } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import ky, { HTTPError } from 'ky'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import { PageForm, PageFormSubmitHandler, useBreakpoint } from '../../framework'
import { PageFormSchema } from '../../framework/PageForm/PageFormSchema'
import { useAutomationServers } from '../automation-servers/AutomationServerProvider'
import { headers } from '../Data'
import { RouteE } from '../Routes'

export default function Login() {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { automationServers, setAutomationServer } = useAutomationServers()

  const [searchParams] = useSearchParams()

  // const addAutomationHost = useAddAutomationServer()

  const { cache } = useSWRConfig()
  useEffect(() => {
    ;(cache as unknown as { clear: () => void }).clear?.()
  }, [cache])

  const DataType = Type.Object({
    server: Type.String({
      title: t('Automation server'),
      placeholder: t('Select automation server'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      variant: 'select',
      options: automationServers.map((host) => ({
        label: host.name,
        description: host.url,
        value: host.url,
        group: host.type === 'controller' ? t('Automation controllers') : t('Automation hubs'),
      })),
      // footer: <Button onClick={addAutomationHost}>{t('Add automation server')}</Button>,
    }),
    username: Type.String({
      title: t('Username'),
      placeholder: t('Enter username'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    }),
    password: Type.String({
      title: t('Password'),
      placeholder: t('Enter password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      variant: 'secret',
    }),
  })

  type Data = Static<typeof DataType>

  const onSubmit = useCallback<PageFormSubmitHandler<Data>>(
    async (data, setError) => {
      try {
        const automationServer = automationServers.find((server) => server.url === data.server)
        if (!automationServer) return
        const loginPageUrl =
          automationServer.type === 'controller'
            ? '/api/login/'
            : automationServer.type === 'hub'
            ? '/api/automation-hub/_ui/v1/auth/login/'
            : undefined

        if (loginPageUrl !== undefined) {
          let loginPage = await ky
            .get(loginPageUrl, {
              credentials: 'include',
              headers: { 'x-server': data.server },
            })
            .text()
          loginPage = loginPage.substring(loginPage.indexOf('csrfToken: '))
          loginPage = loginPage.substring(loginPage.indexOf('"') + 1)
          const csrfmiddlewaretoken = loginPage.substring(0, loginPage.indexOf('"'))

          const searchParams = new URLSearchParams()
          searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken)
          searchParams.set('username', data.username)
          searchParams.set('password', data.password)
          try {
            await ky.post(loginPageUrl, {
              credentials: 'include',
              headers: { 'x-server': data.server },
              body: searchParams,
              redirect: 'manual',
            })
          } catch (err) {
            if (err instanceof HTTPError && err.response.status === 0) {
              // Do nothing
            } else {
              throw err
            }
          }
        }

        localStorage.setItem('server', data.server)
        setAutomationServer(automationServer)
        headers['x-server'] = data.server
        switch (automationServer.type) {
          case 'eda':
            navigate(RouteE.EdaProjects)
            break
          case 'hub':
            navigate(RouteE.HubDashboard)
            break
          default:
            navigate(RouteE.Dashboard)
            break
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(t('Invalid username or password. Please try again.'))
        }
      }
    },
    [automationServers, navigate, setAutomationServer, t]
  )

  const sm = useBreakpoint('sm')
  const md = useBreakpoint('md')

  const padding = md ? 48 : sm ? 32 : 16

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
          schema={DataType}
          submitText={t('Log In')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          isVertical
          singleColumn
          defaultValue={{
            server: searchParams.get('server') ?? localStorage.getItem('server') ?? '',
          }}
          disableScrolling
        >
          <PageFormSchema schema={DataType} />
        </PageForm>
      </PageSection>
    </Page>
  )
}
