import { Page, PageSection, Title } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import ky from 'ky'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FormPageSubmitHandler, PageForm, useBreakpoint } from '../../../framework'
import { useAddAutomationHost } from '../../common/useAddAutomationHostDialog'
import { useProductHosts } from '../../common/useProductHosts'
import { headers } from '../../Data'
import { RouteE } from '../../route'

export default function Login() {
    const { t } = useTranslation()

    const history = useNavigate()

    const { productHosts } = useProductHosts()

    const addAutomationHost = useAddAutomationHost()

    const DataType = Type.Object({
        server: Type.String({
            title: t('Automation server'),
            placeholder: t('Select automation server'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            minLength: 1,
            errorMessage: { required: t('Server is required'), minLength: t('Server is required') },
            variant: 'select',
            options: productHosts.map((host) => ({
                label: host.name,
                description: host.url,
                value: host.url,
                group: host.type === 'controller' ? t('Automation controllers') : t('Automation hubs'),
            })),
            footer: { label: t('Add server'), click: addAutomationHost },
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

    const servers = useMemo<{ server: string; username: string }[]>(() => {
        try {
            const serversString = localStorage.getItem('servers')
            if (typeof serversString === 'string') {
                const servers = JSON.parse(serversString) as { server: string; username: string }[]
                if (Array.isArray(servers)) {
                    if (servers.every((server) => typeof server === 'object')) {
                        return servers.filter((server) => 'server' in server && 'username' in server)
                    }
                }
            }
            return []
        } catch {
            return []
        }
    }, [])

    const onSubmit = useCallback<FormPageSubmitHandler<Data>>(
        async (data, setError) => {
            try {
                let loginPage = await ky.get('/api/login/', { credentials: 'include', headers: { 'x-server': data.server } }).text()
                loginPage = loginPage.substring(loginPage.indexOf('csrfToken: '))
                loginPage = loginPage.substring(loginPage.indexOf('"') + 1)
                const csrfmiddlewaretoken = loginPage.substring(0, loginPage.indexOf('"'))

                const searchParams = new URLSearchParams()
                searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken)
                searchParams.set('username', data.username)
                searchParams.set('password', data.password)
                await ky.post('/api/login/', { credentials: 'include', headers: { 'x-server': data.server }, body: searchParams })

                headers['x-server'] = data.server
                localStorage.setItem('server', data.server)
                localStorage.setItem(
                    'servers',
                    JSON.stringify([...new Set([{ server: data.server, username: data.username }, ...servers])])
                )

                history(RouteE.Organizations)
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError(t('Invalid username or password. Please try again.'))
                }
            }
        },
        [history, servers, t]
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
                    submitText={t('Submit')}
                    onSubmit={onSubmit}
                    cancelText={t('Cancel')}
                    isVertical
                    singleColumn
                    defaultValue={servers.length ? { server: servers[0].server, username: servers[0].username } : {}}
                />
            </PageSection>
        </Page>
    )
}
