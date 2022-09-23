import { Bullseye, Button, PageSection, Stack } from '@patternfly/react-core'
import { useMemo } from 'react'
import { PageHeader } from '../../../framework'
import { randomString } from '../../../framework/utils/random-string'
import { requestPost } from '../../Data'
import { RouteE } from '../../route'
import { Team } from '../access/teams/Team'

export default function Debug() {
    const breadcrumbs = useMemo(() => [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Debug' }], [])
    return (
        <>
            <PageHeader title="Debug" breadcrumbs={breadcrumbs} />
            <PageSection isFilled>
                <Bullseye>
                    <Stack hasGutter style={{ height: 'unset' }}>
                        <Button
                            onClick={() => {
                                for (let i = 0; i < 100; i++) {
                                    requestPost<Team, Partial<Team>>('/api/v2/teams/', {
                                        name: randomString(8),
                                        organization: 1,
                                    }).catch(() => {
                                        // do nothing
                                    })
                                }
                            }}
                            // eslint-disable-next-line i18next/no-literal-string
                        >
                            Create 100 teams
                        </Button>
                    </Stack>
                </Bullseye>
            </PageSection>
        </>
    )
}
