import { ButtonVariant, DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core'
import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Detail, DetailsList, ITypedAction, PageHeader, SinceCell, TypedActions, TypedActionType } from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { PageBody } from '../../../../framework/PageBody'
import { PageLayout } from '../../../../framework/PageLayout'
import { PageTab, PageTabs } from '../../../../framework/PageTabs'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../route'
import { AccessTable } from '../users/Users'
import { Organization } from './Organization'

export function OrganizationDetails() {
    const { t } = useTranslation()
    const params = useParams<{ id: string }>()
    const organization = useItem<Organization>('/api/v2/organizations', params.id)
    const history = useHistory()
    const itemActions: ITypedAction<Organization>[] = useMemo(() => {
        const itemActions: ITypedAction<Organization>[] = [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: EditIcon,
                label: t('Edit organization'),
                shortLabel: t('Edit'),
                onClick: () => history.push(RouteE.EditOrganization.replace(':id', organization?.id.toString() ?? '')),
            },
            { type: TypedActionType.button, icon: TrashIcon, label: t('Delete organization'), onClick: () => null },
        ]
        return itemActions
    }, [history, organization, t])

    return (
        <PageLayout>
            <PageHeader
                title={organization?.name}
                breadcrumbs={[{ label: t('Organizations'), to: RouteE.Organizations }, { label: organization?.name }]}
                headerActions={<TypedActions<Organization> actions={itemActions} dropdownPosition={DropdownPosition.right} />}
            />
            <PageBody>
                {organization ? (
                    <PageTabs
                    // preComponents={
                    //     <Button variant="plain">
                    //         <CaretLeftIcon /> &nbsp;Back to organizations
                    //     </Button>
                    // }
                    // postComponents={
                    //     <Button variant="plain">
                    //         <CaretLeftIcon /> &nbsp;Back to organizations
                    //     </Button>
                    // }
                    >
                        <PageTab title={t('Details')}>
                            <OrganizationDetailsTab organization={organization} />
                        </PageTab>
                        <PageTab title={t('Access')}>
                            <OrganizationAccessTab organization={organization} />
                        </PageTab>
                        <PageTab title={t('Teams')}>TODO</PageTab>
                        <PageTab title={t('Execution Environments')}>TODO</PageTab>
                        <PageTab title={t('Notifications')}>TODO</PageTab>
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

function OrganizationDetailsTab(props: { organization: Organization }) {
    const { t } = useTranslation()
    const { organization } = props
    return (
        <>
            <Scrollable>
                <PageSection variant="light">
                    <DetailsList>
                        <Detail label={t('Name')}>{organization.name}</Detail>
                        <Detail label={t('Created')}>
                            <SinceCell value={organization.created} />
                        </Detail>
                        <Detail label={t('Last modified')}>
                            <SinceCell value={organization.modified} />
                        </Detail>
                    </DetailsList>
                </PageSection>
            </Scrollable>
        </>
    )
}

function OrganizationAccessTab(props: { organization: Organization }) {
    const { organization } = props
    return <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
}
