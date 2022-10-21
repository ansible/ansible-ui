import {
  ButtonVariant,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core'
import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Detail,
  DetailsList,
  ITypedAction,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  SinceCell,
  TypedActions,
  TypedActionType,
} from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../Routes'
import { useControllerView } from '../../useControllerView'
import { Team } from '../teams/Team'
import { useTeamsColumns, useTeamsFilters } from '../teams/Teams'
import { AccessTable } from '../users/Users'
import { Organization } from './Organization'
import { useDeleteOrganizations } from './useDeleteOrganizations'

export function OrganizationDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const organization = useItem<Organization>('/api/v2/organizations', params.id ?? '0')
  const history = useNavigate()

  const deleteOrganizations = useDeleteOrganizations((deleted: Organization[]) => {
    if (deleted.length > 0) {
      history(RouteE.Organizations)
    }
  })

  const itemActions: ITypedAction<Organization>[] = useMemo(() => {
    const itemActions: ITypedAction<Organization>[] = [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit organization'),
        onClick: () =>
          history(RouteE.EditOrganization.replace(':id', organization?.id.toString() ?? '')),
      },
      {
        type: TypedActionType.button,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: () => {
          if (!organization) return
          deleteOrganizations([organization])
        },
      },
    ]
    return itemActions
  }, [deleteOrganizations, history, organization, t])

  return (
    <PageLayout>
      <PageHeader
        title={organization?.name}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteE.Organizations },
          { label: organization?.name },
        ]}
        headerActions={
          <TypedActions<Organization> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      <PageBody>
        {organization ? (
          <PageTabs>
            <PageTab title={t('Details')}>
              <OrganizationDetailsTab organization={organization} />
            </PageTab>
            <PageTab title={t('Access')}>
              <OrganizationAccessTab organization={organization} />
            </PageTab>
            <PageTab title={t('Teams')}>
              <OrganizationTeamsTab organization={organization} />
            </PageTab>
            <PageTab title={t('Execution environments')}>
              <Todo />
            </PageTab>
            <PageTab title={t('Notifications')}>
              <Todo />
            </PageTab>
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
  const history = useNavigate()
  return (
    <>
      <Scrollable>
        <PageSection variant="light">
          <DetailsList>
            <Detail label={t('Name')}>{organization.name}</Detail>
            <Detail label={t('Description')}>{organization.description}</Detail>
            <Detail label={t('Created')}>
              <SinceCell
                value={organization.created}
                author={organization.summary_fields?.created_by?.username}
                onClick={() =>
                  history(
                    RouteE.UserDetails.replace(
                      ':id',
                      (organization.summary_fields?.created_by?.id ?? 0).toString()
                    )
                  )
                }
              />
            </Detail>
            <Detail label={t('Last modified')}>
              <SinceCell
                value={organization.modified}
                author={organization.summary_fields?.modified_by?.username}
                onClick={() =>
                  history(
                    RouteE.UserDetails.replace(
                      ':id',
                      (organization.summary_fields?.modified_by?.id ?? 0).toString()
                    )
                  )
                }
              />
            </Detail>
          </DetailsList>
        </PageSection>
      </Scrollable>
    </>
  )
}

function OrganizationAccessTab(props: { organization: Organization }) {
  const { organization } = props
  const { t } = useTranslation()
  return (
    <PageTabs>
      <PageTab title={t('Users')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
      <PageTab title={t('Teams')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
    </PageTabs>
  )
}

function OrganizationTeamsTab(props: { organization: Organization }) {
  const { organization } = props
  const { t } = useTranslation()
  const history = useNavigate()
  const toolbarFilters = useTeamsFilters()
  const tableColumns = useTeamsColumns()
  const view = useControllerView<Team>({
    url: `/api/v2/organizations/${organization.id}/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  })
  return (
    <PageTable<Team>
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={t('No teams yet')}
      emptyStateDescription={t('To get started, create a team.')}
      emptyStateButtonText={t('Create team')}
      emptyStateButtonClick={() => history(RouteE.CreateTeam)}
      {...view}
    />
  )
}

function Todo() {
  return <PageSection variant="light">TODO</PageSection>
}
