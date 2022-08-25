import { ActionGroup, Alert, AlertGroup, Button, Page, PageSection, SelectOption, Title } from '@patternfly/react-core'
import { Static, Type } from '@sinclair/typebox'
import ky from 'ky'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Collapse, useWindowSizeOrLarger, WindowSize } from '../../../framework'
import { FormPage, FormSelect, FormTextInput } from '../../common/FormPage'
import { headers } from '../../Data'
import BG from '../../icons/background.svg'
import { RouteE } from '../../route'

export const InputType = Type.Object({
    server: Type.String(),
    username: Type.String(),
    password: Type.String(),
})

type InputData = Static<typeof InputType>

export default function Login() {
    const history = useHistory()

    const [error, setError] = useState('')

    const servers = useMemo<{ server: string; username: string }[]>(() => {
        try {
            const serversString = localStorage.getItem('servers')
            const servers = JSON.parse(serversString) as { server: string; username: string }[]
            if (Array.isArray(servers)) {
                if (servers.every((server) => typeof server === 'object')) {
                    return servers.filter((server) => 'server' in server && 'username' in server)
                }
            }
            return []
        } catch {
            return []
        }
    }, [])

    const onSubmit = useCallback(
        (data: InputData) => {
            async function login() {
                try {
                    setError('')

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

                    history.push(RouteE.Dashboard)
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message)
                    } else {
                        setError('Invalid username or password. Please try again.')
                    }
                }
            }
            void login()
        },
        [history, servers]
    )

    const sm = useWindowSizeOrLarger(WindowSize.sm)
    const md = useWindowSizeOrLarger(WindowSize.md)

    const padding = md ? 48 : sm ? 32 : 16

    return (
        <Fragment>
            <BG style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <Page style={{ backgroundColor: sm ? '#222' : 'white', backgroundImage: `url(${BG})` }}>
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
                    <Collapse open={!!error}>
                        <AlertGroup className="pb-16">
                            <Alert variant="danger" title={error ?? ''} isInline />
                        </AlertGroup>
                    </Collapse>
                    <FormPage
                        defaultValues={servers.length ? { server: servers[0].server, username: servers[0].username } : {}}
                        onSubmit={onSubmit}
                        schema={InputType}
                        isVertical
                        hideHeader
                        noPadding
                    >
                        {/* <FormSelectInput name="server" label="Server" required>
                        {servers.map((server, index) => (
                            <SelectOption key={index} value={server.server}>
                                {server.server}
                            </SelectOption>
                        ))}
                    </FormSelectInput> */}
                        <FormSelect name="server" label="Server" required isCreatable>
                            {servers.map((server, index) => (
                                <SelectOption key={index} value={server.server}>
                                    {server.server}
                                </SelectOption>
                            ))}
                        </FormSelect>
                        <FormTextInput name="username" label="Username" required />
                        <FormTextInput name="password" label="Password" required secret autoFocus={servers && servers.length > 0} />
                        <ActionGroup>
                            <Button type="submit" style={{ flexGrow: 1 }}>
                                Log In
                            </Button>
                        </ActionGroup>
                    </FormPage>
                </PageSection>
            </Page>
        </Fragment>
    )
}
