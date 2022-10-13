import { ActionGroup, Alert, Button, PageSection, Stack, StackItem } from '@patternfly/react-core'
import { useTranslation } from 'react-i18next'
import { PageBody, PageHeader, PageLayout } from '../../../../framework'

export function Token() {
    const { t } = useTranslation()
    return (
        <PageLayout>
            <PageHeader title={t('API Token')} />
            <PageBody>
                <PageSection variant="light">
                    <Stack hasGutter>
                        <StackItem>{t('Use this token to authenticate the ansible-galaxy client.')}</StackItem>
                        <Alert variant="warning" isInline title="Warning">
                            {t('Loading a new token will delete your old token.')}
                        </Alert>
                        <ActionGroup>
                            <Button>{t('Load Token')}</Button>
                        </ActionGroup>
                    </Stack>
                </PageSection>
            </PageBody>
        </PageLayout>
    )
}
