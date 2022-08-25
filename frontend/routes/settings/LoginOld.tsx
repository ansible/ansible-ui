import { LoginForm, LoginPage, Title } from '@patternfly/react-core'
import { RedhatIcon } from '@patternfly/react-icons'
import ky from 'ky'
import { MouseEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { RouteE } from '../../route'

export default function Login() {
    const history = useHistory()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const onLoginButtonClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault()
            async function login() {
                try {
                    setError('')

                    let loginPage = await ky.get('/api/login/', { credentials: 'include' }).text()
                    loginPage = loginPage.substring(loginPage.indexOf('csrfToken: '))
                    loginPage = loginPage.substring(loginPage.indexOf('"') + 1)
                    const csrfmiddlewaretoken = loginPage.substring(0, loginPage.indexOf('"'))

                    const searchParams = new URLSearchParams()
                    searchParams.set('csrfmiddlewaretoken', csrfmiddlewaretoken)
                    searchParams.set('username', username)
                    searchParams.set('password', password)
                    await ky.post('/api/login/', { credentials: 'include', body: searchParams })

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
        [history, password, username]
    )

    const images = {
        lg: '/assets/images/pfbg_1200.jpg',
        sm: '/assets/images/pfbg_768.jpg',
        sm2x: '/assets/images/pfbg_768@2x.jpg',
        xs: '/assets/images/pfbg_576.jpg',
        xs2x: '/assets/images/pfbg_576@2x.jpg',
    }

    const textContent = (
        <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            <RedhatIcon style={{ color: '#EE0000', marginTop: -40, width: 128, height: 128 }} />
            <div style={{ color: 'white' }}>
                <Title headingLevel="h2" style={{ fontSize: 'xxx-large', fontWeight: 'bold', lineHeight: 1.2 }}>
                    Red Hat
                </Title>
                <Title headingLevel="h1" style={{ fontSize: 'xxx-large', fontWeight: 'lighter', lineHeight: 1.2 }}>
                    Ansible Automation Platform
                </Title>
            </div>
        </div>
    ) as unknown as string

    return (
        <LoginPage
            backgroundImgSrc={images}
            backgroundImgAlt="Images"
            textContent={textContent}
            loginTitle="Welcome to the Ansible Automation Platform"
        >
            <LoginForm
                usernameLabel="Username"
                usernameValue={username}
                onChangeUsername={setUsername}
                passwordLabel="Password"
                passwordValue={password}
                onChangePassword={setPassword}
                isShowPasswordEnabled
                loginButtonLabel="Log in"
                onLoginButtonClick={onLoginButtonClick}
                isValidUsername={!error}
                isValidPassword={!error}
                showHelperText={!!error}
                helperText={error}
            />
        </LoginPage>
    )
}
