import { PageSection } from '@patternfly/react-core'
import { CopyIcon, EditIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons'
import { Fragment, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Detail, DetailsList, IItemAction, PageHeader, SinceCell, TextCell } from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { PageContent } from '../../../../framework/PageContent'
import { PageTab, PageTabs } from '../../../../framework/PageTabs'
import { DetailActions } from '../../../common/DetailActions'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../route'
import { Team } from './Team'

export function TeamDetails() {
    const { t } = useTranslation()
    const params = useParams<{ id: string }>()
    const team = useItem<Team>('/api/v2/teams', params.id)
    const history = useHistory()
    const itemActions: IItemAction<Team>[] = useMemo(
        () => [
            { icon: SyncIcon, label: t('Sync'), onClick: () => null },
            {
                icon: EditIcon,
                label: t('Edit'),
                onClick: () => history.push(RouteE.TeamEdit.replace(':id', team?.id.toString() ?? '')),
            },
            { icon: CopyIcon, label: t('Copy'), onClick: () => null },
            { icon: TrashIcon, label: t('Delete'), onClick: () => null },
        ],
        [history, team, t]
    )

    return (
        <Fragment>
            <PageHeader
                title={team?.name}
                breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: team?.name }]}
                pageActions={<DetailActions item={team} actions={itemActions} />}
            />
            {team && (
                <PageContent padding={true}>
                    <PageTabs>
                        <PageTab title={t('Details')}>
                            <TeamDetailsTab team={team} />
                        </PageTab>
                    </PageTabs>
                </PageContent>
            )}
        </Fragment>
    )
}

function TeamDetailsTab(props: { team: Team }) {
    const { t } = useTranslation()
    const { team } = props
    return (
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
    )
}
