import { Page, PageSection, Title } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import ky from 'ky'
import { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useWindowSizeOrLarger, WindowSize } from '../../../framework'
import { useTranslation } from '../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../common/FormPage'
import { headers } from '../../Data'
import { RouteE } from '../../route'

export default function Login() {
    const { t } = useTranslation()

    const history = useHistory()

    const DataType = Type.Object({
        server: Type.String({
            title: t('Server'),
            placeholder: t('Enter server'),
            minLength: 1,
            errorMessage: { required: 'Server is required', minLength: 'Server is required' },
        }),
        username: Type.String({
            title: t('Username'),
            placeholder: t('Enter username'),
            minLength: 1,
            errorMessage: { required: 'Username is required', minLength: 'Username is required' },
        }),
        password: Type.String({
            title: t('Password'),
            placeholder: t('Enter password'),
            minLength: 1,
            errorMessage: { required: 'Password is required', minLength: 'Password is required' },
            variant: 'password',
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

                history.push(RouteE.Teams)
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('Invalid username or password. Please try again.')
                }
            }
        },
        [history, servers]
    )

    const sm = useWindowSizeOrLarger(WindowSize.sm)
    const md = useWindowSizeOrLarger(WindowSize.md)

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
                <Title headingLevel="h2">Welcome to the</Title>
                <Title className="pt-8 pb-24" headingLevel="h1">
                    Ansible Automation Platform
                </Title>
                <PageForm
                    schema={DataType}
                    submitText={t('Submit')}
                    onSubmit={onSubmit}
                    cancelText={t('Cancel')}
                    isVertical
                    defaultValue={servers.length ? { server: servers[0].server, username: servers[0].username } : {}}
                />
            </PageSection>
        </Page>
    )
}
