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
import { postRequest, requestGet, requestPatch } from '../../../../frontend/common/crud/Data';
import { useGet, useGetRequest } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useGetAll } from '../../../common/useGetAll';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PageFormPlatformOrganizationsSelect } from '../../organizations/components/PageFormPlatformOrganizationsSelect';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { UserAssignment } from '../../../../frontend/common/access/interfaces/UserAssignment';
import { useDeleteRequest } from '../../../../frontend/common/crud/useDeleteRequest';

const UserType = {
  SystemAdministrator: 'System administrator',
  NormalUser: 'Normal user',
  PlatformAuditor: 'Platform auditor',
};

type IUserInput = PlatformUser & { userType: string; confirmPassword: string };

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postUserRequest = usePostRequest<PlatformUser>();
  const { data: platformAuditorRoleData, isLoading: isLoadingPlatformAuditorRole } = useGet<
    PlatformItemsResponse<PlatformRole>
  >(gatewayV1API`/role_definitions/`, {
    name: 'Platform Auditor',
  });
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
    const createdUser = await postUserRequest(gatewayV1API`/users/`, user);
    if (userType === UserType.PlatformAuditor) {
      await postRequest(gatewayV1API`/role_user_assignments/`, {
        user: createdUser.id,
        role_definition: platformAuditorRoleData?.results?.[0]?.id,
        object_id: null,
      });
    }
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

  if (isLoadingPlatformAuditorRole) {
    return <LoadingPage breadcrumbs />;
  }

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
  const { data: platformAuditorRoleData, isLoading: isLoadingPlatformAuditorRole } = useGet<
    PlatformItemsResponse<PlatformRole>
  >(gatewayV1API`/role_definitions/`, {
    name: 'Platform Auditor',
  });
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
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();
  const onSubmit: PageFormSubmitHandler<IUserInput> = useCallback(
    async (userInput: IUserInput, setError, setFieldError) => {
      const { userType, confirmPassword, ...user } = userInput;
      user.is_superuser = userType === UserType.SystemAdministrator;
      if (userType === UserType.PlatformAuditor && !user.is_system_auditor) {
        await postRequest(gatewayV1API`/role_user_assignments/`, {
          user: user.id,
          role_definition: platformAuditorRoleData?.results?.[0]?.id,
          object_id: null,
        });
      } else if (user.is_system_auditor && userType !== UserType.PlatformAuditor) {
        // Get the platform auditor role assignment
        const platformAuditorRoleAssignment = await getRequest(
          gatewayV1API`/role_user_assignments/`,
          {
            user: user.id,
            role_definition: platformAuditorRoleData?.results?.[0]?.id || '',
          }
        );
        // Delete the platform auditor role assignment
        await deleteRequest(
          gatewayV1API`/role_user_assignments/${platformAuditorRoleAssignment?.results?.[0].id?.toString()}/`
        );
      }
      if (user.password) {
        if (confirmPassword !== user.password) {
          setFieldError('confirmPassword', { message: t('Password does not match.') });
          return false;
        }
      }
      user.is_system_auditor = userType === UserType.PlatformAuditor;
      await patchUser(gatewayV1API`/users/${id.toString()}/`, user);
      navigate(-1);
    },
    [deleteRequest, getRequest, id, navigate, patchUser, platformAuditorRoleData?.results, t]
  );
  const getPageUrl = useGetPageUrl();

  const userWithTeams = useMemo(() => {
    if (!user) return undefined;
    if (!teams) return undefined;
    const teamIds = teams.filter((team) => team.users.includes(user.id)).map((team) => team.id);
    return { ...user, teams: teamIds };
  }, [teams, user]);

  if (isLoading || isTeamsLoading || isLoadingPlatformAuditorRole)
    return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (teamError) return <AwxError error={teamError} />;
  if (!userWithTeams) return <PageNotFound />;

  const { password, ...defaultUserValue } = userWithTeams;
  const defaultValue: Partial<IUserInput> = {
    ...defaultUserValue,
    userType: userWithTeams.is_superuser
      ? UserType.SystemAdministrator
      : userWithTeams.is_system_auditor
        ? UserType.PlatformAuditor
        : UserType.NormalUser,
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
              label: t('Platform auditor'),
              description: t('Has view permissions to all objects.'),
              value: UserType.PlatformAuditor,
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
    </>
  );
}
