/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ButtonVariant,
  Chip,
  ChipGroup,
  DropdownPosition,
  PageSection,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  SinceCell,
  TextCell,
} from '../../../../framework';
import { Scrollable } from '../../../../framework/components/Scrollable';
import { useSettings } from '../../../../framework/Settings';
import { useItem } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { Team } from '../../interfaces/Team';
import { User } from '../../interfaces/User';
import { useControllerView } from '../../useControllerView';
import { useUsersColumns, useUsersFilters } from '../users/Users';
import { useTeamActions } from './hooks/useTeamActions';

export function TeamDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const team = useItem<Team>('/api/v2/teams', params.id ?? '0');
  const navigate = useNavigate();
  const itemActions = useTeamActions({ onTeamsDeleted: () => navigate(RouteE.Teams) });
  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: team?.name }]}
        headerActions={
          <PageActions<Team>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      <PageTabs loading={!team}>
        <PageTab label={t('Details')}>
          <TeamDetailsTab team={team!} />
        </PageTab>
        <PageTab label={t('Access')}>
          <TeamAccessTab team={team!} />
        </PageTab>
        <PageTab label={t('Roles')}>TODO</PageTab>
      </PageTabs>
    </PageLayout>
  );
}

function TeamDetailsTab(props: { team: Team }) {
  const { t } = useTranslation();
  const { team } = props;
  const history = useNavigate();
  const settings = useSettings();
  return (
    <Scrollable>
      <PageSection
        variant="light"
        style={{
          backgroundColor:
            settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
        }}
      >
        <PageDetails>
          <PageDetail label={t('Name')}>{team.name}</PageDetail>
          <PageDetail label={t('Description')}>{team.description}</PageDetail>
          <PageDetail label={t('Organization')}>
            <TextCell
              text={team.summary_fields?.organization?.name}
              to={RouteE.OrganizationDetails.replace(
                ':id',
                (team.summary_fields?.organization?.id ?? '').toString()
              )}
            />
          </PageDetail>
          <PageDetail label={t('Created')}>
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
          </PageDetail>
          <PageDetail label={t('Last modified')}>
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
          </PageDetail>
        </PageDetails>
      </PageSection>
    </Scrollable>
  );
}

function TeamAccessTab(props: { team: Team }) {
  const { team } = props;
  const { t } = useTranslation();

  const toolbarFilters = useUsersFilters();

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add users'),
        shortLabel: t('Add'),
        onClick: () => null,
      },
      {
        type: PageActionType.bulk,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Remove selected users'),
        shortLabel: t('Remove'),
        onClick: () => null,
      },
    ],
    [t]
  );

  // Table Columns
  const tableColumns = useUsersColumns();
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
  });

  // Row Actions
  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  );

  const view = useControllerView<User>({
    url: `/api/v2/teams/${team.id}/access_list/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const history = useNavigate();

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
  );
}
