import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageForm,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormAsyncMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { requestGet, requestPatch } from '../../../../frontend/common/crud/Data';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useGetAll } from '../../../common/useGetAll';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformUser>();
  const onSubmit: PageFormSubmitHandler<PlatformUser> = async (user) => {
    const createdUser = await postRequest(gatewayV1API`/users/`, user);
    const teamIds = (user as unknown as { teams: number[] }).teams;
    if (teamIds) {
      for (const teamId of teamIds) {
        const team = await requestGet<PlatformTeam>(gatewayV1API`/teams/${teamId.toString()}/`);
        team.users.push(createdUser.id);
        await requestPatch<PlatformTeam>(gatewayV1API`/teams/${teamId.toString()}/`, {
          users: team.users,
        });
      }
    }
    pageNavigate(PlatformRoute.UserDetails, { params: { id: createdUser.id } });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Create user') },
        ]}
      />
      <PageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
      >
        <PlatformUserInputs isCreate />
      </PageForm>
    </PageLayout>
  );
}

export function EditPlatformUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const {
    data: user,
    isLoading,
    error,
  } = useGet<PlatformUser>(gatewayV1API`/users/${id.toString()}/`);
  const {
    items: teams,
    isLoading: isTeamsLoading,
    error: teamError,
  } = useGetAll<PlatformTeam>(gatewayV1API`/teams/`);
  const patchUser = usePatchRequest<PlatformUser, PlatformUser>();
  const patchTeam = usePatchRequest<Partial<PlatformTeam>, PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformUser> = useCallback(
    async (user) => {
      await patchUser(gatewayV1API`/users/${id.toString()}/`, user);
      const teamIds = (user as unknown as { teams: number[] }).teams;
      if (teamIds && teams) {
        for (const team of teams) {
          if (teamIds.includes(team.id)) {
            if (team.users.find((id) => id === user.id) === undefined) {
              team.users.push(user.id);
              await patchTeam(gatewayV1API`/teams/${team.id.toString()}/`, { users: team.users });
            }
          } else {
            if (team.users.find((id) => id === user.id) !== undefined) {
              team.users = team.users.filter((id) => id !== user.id);
              await patchTeam(gatewayV1API`/teams/${team.id.toString()}/`, { users: team.users });
            }
          }
        }
      }
      navigate(-1);
    },
    [id, navigate, patchTeam, patchUser, teams]
  );
  const getPageUrl = useGetPageUrl();

  const userWithTeams = useMemo(() => {
    if (!user) return undefined;
    if (!teams) return undefined;
    const teamIds = teams.filter((team) => team.users.includes(user.id)).map((team) => team.id);
    return { ...user, teams: teamIds };
  }, [teams, user]);

  if (isLoading || isTeamsLoading) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (teamError) return <AwxError error={teamError} />;
  if (!userWithTeams) return <PageNotFound />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Edit user') },
        ]}
      />
      <PageForm
        submitText={t('Save user')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={userWithTeams as unknown as PlatformUser}
      >
        <PlatformUserInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformUserInputs(props: { isCreate?: boolean }) {
  const { t } = useTranslation();

  const queryTeams = useCallback(async (page: number) => {
    const teams = await requestGet<PlatformItemsResponse<PlatformTeam>>(
      gatewayV1API`/teams/?page=${page.toString()}`
    );
    return {
      total: teams.count,
      options: teams.results.map((team) => ({
        label: team.name,
        value: team.id,
      })),
    };
  }, []);
  const queryOrganizations = useCallback(async (page: number) => {
    const organizations = await requestGet<PlatformItemsResponse<PlatformOrganization>>(
      gatewayV1API`/organizations/?page=${page.toString()}`
    );
    return {
      total: organizations.count,
      options: organizations.results.map((organization) => ({
        label: organization.name,
        value: organization.id,
      })),
    };
  }, []);
  return (
    <>
      <PageFormSection>
        <PageFormTextInput<PlatformUser>
          name="username"
          label={t('Username')}
          placeholder={t('Enter username')}
          isRequired
        />
        <PageFormTextInput<PlatformUser>
          name="password"
          label={t('Password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired={props.isCreate}
        />
      </PageFormSection>

      <PageFormTextInput<PlatformUser>
        name="first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
      />
      <PageFormTextInput<PlatformUser>
        name="last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
      />
      <PageFormTextInput<PlatformUser>
        name="email"
        label={t('Email')}
        placeholder={t('Enter email')}
      />

      <PageFormSection title={t('User Type')} singleColumn>
        <PageFormCheckbox<PlatformUser>
          name="is_superuser"
          label={t('System administrator')}
          description={t(
            'System administrators have full access to the system and can manage other users.'
          )}
        />
        <PageFormCheckbox<PlatformUser>
          name="is_system_auditor"
          label={t('System auditor')}
          description={t(
            'System auditors have read-only access to the system and can view all resources.'
          )}
        />
      </PageFormSection>

      <PageFormSection singleColumn title={t('Organizations')}>
        <PageFormAsyncMultiSelect<PlatformUser>
          name="organizations"
          placeholder={t('Select organizations')}
          queryOptions={queryOrganizations}
          queryPlaceholder={t('Loading organizations...')}
          queryErrorText={(error) => t('Error loading organizations: {{error}}', { error })}
        />
      </PageFormSection>

      <PageFormSection singleColumn title={t('Teams')}>
        <PageFormAsyncMultiSelect
          name="teams"
          placeholder={t('Select teams')}
          queryOptions={queryTeams}
          isRequired
          queryPlaceholder={t('Loading teams...')}
          queryErrorText={(error) => t('Error loading teams: {{error}}', { error })}
        />
      </PageFormSection>
    </>
  );
}
