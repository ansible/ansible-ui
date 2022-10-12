import { Page, PageSection, Title } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import ky, { HTTPError } from 'ky'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import { FormPageSubmitHandler, PageForm, useBreakpoint } from '../../framework'
import { headers } from '../Data'
import { RouteE } from '../Routes'
import { useAddAutomationServer } from './useAddAutomationServer'
import { useAutomationServers } from './useAutomationServer'

export default function Login() {
    const { t } = useTranslation()

    const navigate = useNavigate()

    const { automationServers } = useAutomationServers()

    const [searchParams] = useSearchParams()

    const addAutomationHost = useAddAutomationServer()

    const { cache } = useSWRConfig()
    useEffect(() => {
        ;(cache as unknown as { clear: () => void }).clear?.()
    }, [cache])

    const DataType = Type.Object({
        server: Type.String({
            title: t('Automation server'),
            placeholder: t('Select automation server'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            errorMessage: { required: t('Server is required'), minLength: t('Server is required') },
            variant: 'select',
            options: automationServers.map((host) => ({
                label: host.name,
                description: host.url,
                value: host.url,
                group: host.type === 'controller' ? t('Automation controllers') : t('Automation hubs'),
            })),
            footer: { label: t('Add automation server'), click: addAutomationHost },
        }),
        username: Type.String({
            title: t('Username'),
            placeholder: t('Enter username'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            errorMessage: { required: t('Username is required'), minLength: t('Username is required') },
        }),
        password: Type.String({
            title: t('Password'),
            placeholder: t('Enter password'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            errorMessage: { required: t('Password is required'), minLength: t('Password is required') },
            variant: 'secret',
        }),
    })

    type Data = Static<typeof DataType>

    const onSubmit = useCallback<FormPageSubmitHandler<Data>>(
        async (data, setError) => {
            try {
                const automationServer = automationServers.find((server) => server.url === data.server)
                if (!automationServer) return
                const loginPageUrl = automationServer.type === 'controller' ? '/api/login/' : '/api/automation-hub/_ui/v1/auth/login/'

                let loginPage = await ky.get(loginPageUrl, { credentials: 'include', headers: { 'x-server': data.server } }).text()
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
                    console.log(err)
                    if (err instanceof HTTPError && err.response.status === 0) {
                        // Do nothing
                    } else {
                        throw err
                    }
                }

                localStorage.setItem('server', data.server)
                headers['x-server'] = data.server
                navigate(RouteE.Organizations)
                switch (automationServer.type) {
                    case 'hub':
                        navigate(RouteE.Hub)
                        break
                    default:
                        navigate(RouteE.Organizations)
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
        [automationServers, navigate, t]
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
                />
            </PageSection>
        </Page>
    )
}
