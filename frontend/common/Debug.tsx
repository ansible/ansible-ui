/* eslint-disable i18next/no-literal-string */
import { Bullseye, Button, PageSection, Stack } from '@patternfly/react-core'
import { useCallback, useMemo } from 'react'
import { PageHeader } from '../../framework'
import { useBulkProgressDialog } from '../../framework/BulkProgressDialog'
import { randomString } from '../../framework/utils/random-string'
import { Team } from '../controller/access/teams/Team'
import { requestPost } from '../Data'
import { RouteE } from '../Routes'

export default function Debug() {
    const breadcrumbs = useMemo(() => [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Debug' }], [])
    const createTeams = useCreateTeams()
    return (
        <>
            <PageHeader title="Debug" breadcrumbs={breadcrumbs} />
            <PageSection isFilled>
                <Bullseye>
                    <Stack hasGutter style={{ height: 'unset' }}>
                        <Button onClick={() => createTeams(10)}>Create 10 teams</Button>
                        <Button onClick={() => createTeams(100)}>Create 100 teams</Button>
                        <Button onClick={() => createTeams(1000)}>Create 1000 teams</Button>
                    </Stack>
                </Bullseye>
            </PageSection>
        </>
    )
}

function useCreateTeams() {
    const openBulkProgressDialog = useBulkProgressDialog()
    const createTeams = useCallback(
        (count: number) => {
            const teams = new Array(count).fill(0).map(() => ({ name: randomString(8), organization: 1 })) as Partial<Team>[]
            openBulkProgressDialog({
                title: `Creating ${count} teams`,
                keyFn: (team: Partial<Team>) => team.name ?? '',
                items: teams,
                columns: [{ header: 'Name', cell: (team: Partial<Team>) => team.name ?? '' }],
                actionFn: (team, signal) => requestPost<Team, Partial<Team>>('/api/v2/teams/', team, signal),
                processingText: 'Creating teams...',
                successText: 'All teams created successfully.',
                errorText: 'There were errors creating teams.',
            })
        },
        [openBulkProgressDialog]
    )
    return createTeams
}
