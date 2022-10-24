import {
  ButtonVariant,
  Chip,
  ChipGroup,
  DropdownPosition,
  PageSection,
} from '@patternfly/react-core'
import { EditIcon, MinusCircleIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Detail,
  DetailsList,
  DetailsSkeleton,
  ITypedAction,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  SinceCell,
  TextCell,
  TypedActions,
  TypedActionType,
} from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useSettings } from '../../../../framework/Settings'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../Routes'
import { useControllerView } from '../../useControllerView'
import { User } from '../users/User'
import { useUsersColumns, useUsersFilters } from '../users/Users'
import { useDeleteTeams } from './hooks/useDeleteTeams'
import { Team } from './Team'

export function TeamDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const team = useItem<Team>('/api/v2/teams', params.id ?? '0')
  const history = useNavigate()
  const deleteTeams = useDeleteTeams((deletedTeams: Team[]) => {
    if (deletedTeams.length > 0) {
      history(RouteE.Teams)
    }
  })

  const itemActions: ITypedAction<Team>[] = useMemo(() => {
    const itemActions: ITypedAction<Team>[] = [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit team'),
        onClick: () => history(RouteE.EditTeam.replace(':id', team?.id.toString() ?? '')),
      },
      {
        type: TypedActionType.button,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: () => {
          if (!team) return
          deleteTeams([team])
        },
      },
    ]
    return itemActions
  }, [t, history, team, deleteTeams])

  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: team?.name }]}
        headerActions={
          <TypedActions<Team> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      <PageBody>
        {team ? (
          <PageTabs
          // preComponents={
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
                <DetailsSkeleton />
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
  const history = useNavigate()
  const settings = useSettings()
  return (
    <>
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <DetailsList>
            <Detail label={t('Name')}>{team.name}</Detail>
            <Detail label={t('Description')}>{team.description}</Detail>
            <Detail label={t('Organization')}>
              <TextCell
                text={team.summary_fields?.organization?.name}
                to={RouteE.OrganizationDetails.replace(
                  ':id',
                  (team.summary_fields?.organization?.id ?? '').toString()
                )}
              />
            </Detail>
            <Detail label={t('Created')}>
              <SinceCell
                value={team.created}
                author={team.summary_fields?.created_by?.username}
                onClick={() =>
                  history(
                    RouteE.UserDetails.replace(
                      ':id',
                      (team.summary_fields?.created_by?.id ?? 0).toString()
                    )
                  )
                }
              />
            </Detail>
            <Detail label={t('Last modified')}>
              <SinceCell
                value={team.modified}
                author={team.summary_fields?.modified_by?.username}
                onClick={() =>
                  history(
                    RouteE.UserDetails.replace(
                      ':id',
                      (team.summary_fields?.modified_by?.id ?? 0).toString()
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

function TeamAccessTab(props: { team: Team }) {
  const { team } = props
  const { t } = useTranslation()

  const toolbarFilters = useUsersFilters()

  const toolbarActions = useMemo<ITypedAction<User>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add users'),
        shortLabel: t('Add'),
        onClick: () => null,
      },
      {
        type: TypedActionType.bulk,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Remove selected users'),
        shortLabel: t('Remove'),
        onClick: () => null,
      },
    ],
    [t]
  )

  // Table Columns
  const tableColumns = useUsersColumns()
  tableColumns.splice(1, 0, {
    header: t('Roles'),
    cell: (user) => (
      <ChipGroup>
        {user.summary_fields?.indirect_access?.map((access) => (
          <Chip key={access.role.id} isReadOnly>
            {access.role.name}
          </Chip>
        ))}
      </ChipGroup>
    ),
  })

  // Row Actions
  const rowActions = useMemo<ITypedAction<User>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  )

  const view = useControllerView<User>({
    url: `/api/v2/teams/${team.id}/access_list/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  })

  const history = useNavigate()

  return (
    <PageTable<User>
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('No users yet')}
      emptyStateDescription={t('To get started, create a user.')}
      emptyStateButtonText={t('Create user')}
      emptyStateButtonClick={() => history(RouteE.CreateUser)}
      {...view}
    />
  )
}
