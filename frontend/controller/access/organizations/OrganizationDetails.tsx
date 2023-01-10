import {
  ButtonVariant,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
  ChipGroup,
} from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
} from '../../../../framework';
import { useItem, useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { Credential } from '../../interfaces/Credential';
import { Team } from '../../interfaces/Team';
import { useControllerView } from '../../useControllerView';
import { CredentialChip } from '../../common/CredentialChip';
import { useTeamsColumns } from '../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../teams/hooks/useTeamsFilters';
import { AccessTable } from '../users/Users';
import { useDeleteOrganizations } from './hooks/useDeleteOrganizations';

export function OrganizationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const organization = useItem<Organization>('/api/v2/organizations', params.id ?? '0');
  const history = useNavigate();

  const deleteOrganizations = useDeleteOrganizations((deleted: Organization[]) => {
    if (deleted.length > 0) {
      history(RouteE.Organizations);
    }
  });

  const itemActions: IPageAction<Organization>[] = useMemo(() => {
    const itemActions: IPageAction<Organization>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit organization'),
        onClick: () =>
          history(RouteE.EditOrganization.replace(':id', organization?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: () => {
          if (!organization) return;
          deleteOrganizations([organization]);
        },
      },
    ];
    return itemActions;
  }, [deleteOrganizations, history, organization, t]);

  return (
    <PageLayout>
      <PageHeader
        title={organization?.name}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteE.Organizations },
          { label: organization?.name },
        ]}
        headerActions={
          <PageActions<Organization> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      {organization ? (
        <PageTabs>
          <PageTab label={t('Details')}>
            <OrganizationDetailsTab organization={organization} />
          </PageTab>
          <PageTab label={t('Access')}>
            <OrganizationAccessTab organization={organization} />
          </PageTab>
          <PageTab label={t('Teams')}>
            <OrganizationTeamsTab organization={organization} />
          </PageTab>
          <PageTab label={t('Execution environments')}>
            <Todo />
          </PageTab>
          <PageTab label={t('Notifications')}>
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
    </PageLayout>
  );
}

function OrganizationDetailsTab(props: { organization: Organization }) {
  const { t } = useTranslation();
  const { organization } = props;
  const history = useNavigate();
  const params = useParams<{ id: string }>();

  const { data } = useGet<{ results: Credential[] }>(
    `/api/v2/organizations/${params.id ?? '0'}/galaxy_credentials/`
  );
  const galaxyCredentials = data?.results ?? [];

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{organization.name}</PageDetail>
      <PageDetail label={t('Description')}>{organization.description}</PageDetail>
      {/* {license_info?.license_type !== 'open' ? (
        <PageDetail label={t('Max hosts')}>{organization.max_hosts}</PageDetail>
      ) : null} */}
      {/* <ExecutionEnvironmentDetail
        virtualEnvironment={custom_virtualenv}
        executionEnvironment={summary_fields?.default_environment}
        isDefaultEnvironment
        helpText={t`The execution environment that will be used for jobs
          inside of this organization. This will be used a fallback when
          an execution environment has not been explicitly assigned at the
          project, job template or workflow level.`}
      /> */}
      <PageDetail label={t('Created')}>
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
      </PageDetail>
      <PageDetail label={t('Last modified')}>
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
      </PageDetail>
      {/* {instanceGroups && (
        <Detail
          fullWidth
          label={t`Instance Groups`}
          helpText={t`The Instance Groups for this Organization to run on.`}
          value={<InstanceGroupLabels labels={instanceGroups} isLinkable />}
          isEmpty={instanceGroups.length === 0}
        />
      )} */}
      <PageDetail label={t('Galaxy Credentials')} isEmpty={galaxyCredentials?.length === 0}>
        <ChipGroup numChips={5} ouiaId="galaxy-credential-chips">
          {galaxyCredentials?.map((credential) => (
            <Link key={credential.id} to={`/credentials/${credential.id}/details`}>
              <CredentialChip credential={credential} key={credential.id} isReadOnly />
            </Link>
          ))}
        </ChipGroup>
      </PageDetail>
    </PageDetails>
  );
}

function OrganizationAccessTab(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();
  return (
    <PageTabs>
      <PageTab label={t('Users')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
      <PageTab label={t('Teams')}>
        <AccessTable url={`/api/v2/organizations/${organization.id}/access_list/`} />
      </PageTab>
    </PageTabs>
  );
}

function OrganizationTeamsTab(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();
  const history = useNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useControllerView<Team>({
    url: `/api/v2/organizations/${organization.id}/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
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
  );
}

function Todo() {
  return <PageSection variant="light">TODO</PageSection>;
}
