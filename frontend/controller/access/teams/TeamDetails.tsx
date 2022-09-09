import { PageSection, Skeleton, Stack } from '@patternfly/react-core'
import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Detail, DetailsList, IItemAction, PageHeader, SinceCell, TextCell } from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { PageBody } from '../../../../framework/PageBody'
import { PageLayout } from '../../../../framework/PageLayout'
import { PageTab, PageTabs } from '../../../../framework/PageTabs'
import { DetailActions } from '../../../common/DetailActions'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../route'
import { AccessTable } from '../users/Users'
import { Team } from './Team'

export function TeamDetails() {
    const { t } = useTranslation()
    const params = useParams<{ id: string }>()
    const team = useItem<Team>('/api/v2/teams', params.id)
    const history = useHistory()
    const itemActions: IItemAction<Team>[] = useMemo(
        () => [
            {
                icon: EditIcon,
                label: t('Edit'),
                onClick: () => history.push(RouteE.EditTeam.replace(':id', team?.id.toString() ?? '')),
            },
            { icon: TrashIcon, label: t('Delete'), onClick: () => null },
        ],
        [history, team, t]
    )

    return (
        <PageLayout>
            <PageHeader
                title={team?.name}
                breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: team?.name }]}
                headerActions={<DetailActions<Team> item={team} actions={itemActions} />}
            />
            <PageBody>
                {team ? (
                    <PageTabs
                    // preComponents={
                    //     <Button variant="plain">
                    //         <CaretLeftIcon /> &nbsp;Back to teams
                    //     </Button>
                    // }
                    // postComponents={
                    //     <Button variant="plain">
                    //         <CaretLeftIcon /> &nbsp;Back to teams
                    //     </Button>
                    // }
                    >
                        <PageTab title={t('Details')}>
                            <TeamDetailsTab team={team} />
                        </PageTab>
                        <PageTab title={t('Access')}>
                            <TeamAccessTab team={team} />
                        </PageTab>
                        <PageTab title={t('Roles')}>TODO</PageTab>
                    </PageTabs>
                ) : (
                    <PageTabs>
                        <PageTab>
                            <PageSection variant="light">
                                <Stack hasGutter>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </Stack>
                            </PageSection>
                        </PageTab>
                    </PageTabs>
                )}
            </PageBody>
        </PageLayout>
    )
}

function TeamDetailsTab(props: { team: Team }) {
    const { t } = useTranslation()
    const { team } = props
    return (
        <>
            <Scrollable>
                <PageSection variant="light">
                    <DetailsList>
                        <Detail label={t('Name')}>{team.name}</Detail>
                        <Detail label={t('Organization')}>
                            <TextCell
                                text={team.summary_fields.organization.name}
                                to={RouteE.OrganizationDetails.replace(':id', team.summary_fields.organization.id.toString())}
                            />
                        </Detail>
                        <Detail label={t('Created')}>
                            <SinceCell value={team.created} />
                        </Detail>
                        <Detail label={t('Last modified')}>
                            <SinceCell value={team.modified} />
                        </Detail>
                    </DetailsList>
                </PageSection>
            </Scrollable>
        </>
    )
}

function TeamAccessTab(props: { team: Team }) {
    const { team } = props
    return <AccessTable url={`/api/v2/teams/${team.id}/access_list/`} />
}
