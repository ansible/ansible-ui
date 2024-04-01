import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { requestGet, requestPatch } from '../../../../frontend/common/crud/Data';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useGetAll } from '../../../common/useGetAll';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PageFormPlatformOrganizationsSelect } from '../../organizations/components/PageFormPlatformOrganizationsSelect';
import { PageFormPlatformTeamsSelect } from '../../teams/components/PageFormPlatformTeamsSelect';

const UserType = {
  SystemAdministrator: 'System administrator',
  NormalUser: 'Normal user',
};

type IUserInput = PlatformUser & { userType: string; confirmPassword: string };

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformUser>();
  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput,
    setError,
    setFieldError
  ) => {
    const { userType, confirmPassword, ...user } = userInput;
    user.is_superuser = userType === UserType.SystemAdministrator;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
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
  const defaultValue: Partial<IUserInput> = {
    userType: UserType.NormalUser,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Create user') },
        ]}
      />
      <PageForm<IUserInput>
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValue}
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
  const onSubmit: PageFormSubmitHandler<IUserInput> = useCallback(
    async (userInput: IUserInput, setError, setFieldError) => {
      const { userType, confirmPassword, ...user } = userInput;
      user.is_superuser = userType === UserType.SystemAdministrator;
      if (user.password) {
        if (confirmPassword !== user.password) {
          setFieldError('confirmPassword', { message: t('Password does not match.') });
          return false;
        }
      }
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
    [id, navigate, patchTeam, patchUser, t, teams]
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

  const { password, ...defaultUserValue } = userWithTeams;
  const defaultValue: Partial<IUserInput> = {
    ...defaultUserValue,
    userType: userWithTeams.is_superuser ? UserType.SystemAdministrator : UserType.NormalUser,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Edit user') },
        ]}
      />
      <PageForm<IUserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValue}
      >
        <PlatformUserInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformUserInputs(props: { isCreate?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <PageFormSection>
        <PageFormTextInput<IUserInput>
          name="username"
          label={t('Username')}
          placeholder={t('Enter username')}
          isRequired
        />
        <PageFormSingleSelect<IUserInput>
          name="userType"
          label={t('User type')}
          placeholder={t('Select user type')}
          options={[
            {
              label: t('System administrator'),
              description: t('Has full access to the system and can manage other users.'),
              value: UserType.SystemAdministrator,
            },
            {
              label: t('Normal user'),
              description: t(
                'Has access limited to the resources for which they have been granted the appropriate roles.'
              ),
              value: UserType.NormalUser,
            },
          ]}
          isRequired
        />
      </PageFormSection>

      <PageFormSection>
        <PageFormTextInput<PlatformUser>
          name="password"
          label={t('Password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired={props.isCreate}
        />
        <PageFormTextInput<IUserInput>
          name="confirmPassword"
          label={t('Confirm password')}
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

      <PageFormSection singleColumn>
        <PageFormPlatformOrganizationsSelect name="organizations" />
      </PageFormSection>

      <PageFormSection singleColumn>
        <PageFormPlatformTeamsSelect name="teams" />
      </PageFormSection>
    </>
  );
}
