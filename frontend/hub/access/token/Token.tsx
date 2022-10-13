import { ActionGroup, Alert, Button, PageSection, Stack } from '@patternfly/react-core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyCell, PageBody, PageHeader, PageLayout } from '../../../../framework'
import { requestPost } from '../../../Data'

export function Token() {
    const { t } = useTranslation()
    const [working, setWorking] = useState(false)
    const [token, setToken] = useState('')
    const [error, setError] = useState('')
    const onClick = async () => {
        try {
            setWorking(true)
            setError('')
            const result = await requestPost<{ token: string }>('/api/automation-hub/v3/auth/token/', {})
            setToken(result.token)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError(t('An unknown error occured.'))
            }
        } finally {
            setWorking(false)
        }
    }
    return (
        <PageLayout>
            <PageHeader title={t('API Token')} description={t('An API token can be used to authenticate the ansible-galaxy client.')} />
            <PageBody>
                <PageSection variant="light">
                    {token ? (
                        <Stack hasGutter>
                            <Alert
                                variant="warning"
                                isInline
                                title={t('Copy this token now. This is the only time you will ever see it.')}
                            />
                            <CopyCell text={token} />
                        </Stack>
                    ) : (
                        <Stack hasGutter>
                            <Alert variant="warning" isInline title={t('Loading a new token will delete your old token.')} />
                            <ActionGroup>
                                <Button
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    onClick={onClick}
                                    isDisabled={working}
                                >
                                    {t('Load Token')}
                                </Button>
                            </ActionGroup>
                            {error && <Alert variant="danger" isInline title={error} />}
                        </Stack>
                    )}
                </PageSection>
            </PageBody>
        </PageLayout>
    )
}
