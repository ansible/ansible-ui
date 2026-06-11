import {
  LoadingPage,
  PageForm,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { useGet, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PageFormPlatformOrganizationsSelect } from '../../organizations/components/PageFormPlatformOrganizationsSelect';
import { useGetOrganizationsForUser } from '../hooks/useGetOrganizationsForUser';
import { useGetPlatformUsers } from '../hooks/useGetPlatformUsers';

enum USER_TYPE_ENUM {
  Normal = 'normal',
  Admin = 'admin',
  Auditor = 'auditor',
}

export type IUserInput = PlatformUser & {
  confirmPassword: string;
  organizations: number[];
  userType: USER_TYPE_ENUM;
};

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const alertToaster = usePageAlertToaster();
  const postUserRequest = usePostRequest<PlatformUser>();
  const { data: platformAuditorRoleData, isLoading: isLoadingPlatformAuditorRole } = useGet<
    PlatformItemsResponse<PlatformRole>
  >(gatewayAPI`/role_definitions/`, {
    name: 'Platform Auditor',
  });

  const { data: organizationMemberRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Organization Member',
    }
  );

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (
    userInput,
    setError,
    setFieldError
  ) => {
    const { confirmPassword, organizations, userType, ...user } = userInput;
    user.is_superuser = userType === USER_TYPE_ENUM.Admin;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const createdUser = await postUserRequest(gatewayAPI`/users/`, user);
    if (userType === USER_TYPE_ENUM.Auditor) {
      await postRequest(gatewayAPI`/role_user_assignments/`, {
        user: createdUser.id,
        role_definition: platformAuditorRoleData?.results?.[0]?.id,
        object_id: null,
      });
    }
    if (organizations) {
      for (const orgId of organizations) {
        try {
          await postRequest(gatewayAPI`/role_user_assignments/`, {
            user: createdUser.id,
            role_definition: organizationMemberRoleData?.results?.[0]?.id,
            object_id: orgId,
          });
        } catch (error) {
          const { genericErrors, fieldErrors } = awxErrorAdapter(error);
          alertToaster.addAlert({
            variant: 'danger',
            title: t('Failed to associate organization with id: {{organizationId}}.', {
              organizationId: orgId,
            }),
            timeout: 5000,
            children: (
              <>
                {genericErrors?.map((err) => err.message)}
                {fieldErrors?.map((err) => err.message)}
              </>
            ),
          });
        }
      }
    }
    pageNavigate(PlatformRoute.UserDetails, { params: { id: createdUser.id } });
  };
  const getPageUrl = useGetPageUrl();
  const defaultValue: Partial<IUserInput> = {
    userType: USER_TYPE_ENUM.Normal,
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
        onCancel={() => void navigate(-1)}
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
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const alertToaster = usePageAlertToaster();
  const userId = Number(params.id);

  const { platformUser, isLoading } = useGetPlatformUsers(userId);

  const { orgIds, getAddedAndRemovedOrganizationIds } = useGetOrganizationsForUser(userId);
  const { data: platformAuditorRoleData, isLoading: isLoadingPlatformAuditorRole } = useGet<
    PlatformItemsResponse<PlatformRole>
  >(gatewayAPI`/role_definitions/`, {
    name: 'Platform Auditor',
  });

  const { data: organizationMemberRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Organization Member',
    }
  );
  const patchUser = usePatchRequest<PlatformUser, PlatformUser>();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();

  const userTypeFromUser = () => {
    if (platformUser?.is_superuser) {
      return USER_TYPE_ENUM.Admin;
    }
    if (platformUser?.is_platform_auditor) {
      return USER_TYPE_ENUM.Auditor;
    } else {
      return USER_TYPE_ENUM.Normal;
    }
  };

  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayAPI`/users/${userId?.toString() ?? ''}/organizations/`
  );
  const organizationIds = useMemo(
    () => organizationsData?.results.map((organization) => organization.id) ?? [],
    [organizationsData]
  );

  const onSubmit: PageFormSubmitHandler<IUserInput> = useCallback(
    async (userInput: IUserInput, setError, setFieldError) => {
      const { confirmPassword, organizations, userType, ...user } = userInput;
      user.is_superuser = userType === USER_TYPE_ENUM.Admin;

      if (userType === USER_TYPE_ENUM.Auditor && !user.is_platform_auditor) {
        await postRequest(gatewayAPI`/role_user_assignments/`, {
          user: user?.id,
          role_definition: platformAuditorRoleData?.results?.[0]?.id,
          object_id: null,
        });
      } else if (userType !== USER_TYPE_ENUM.Auditor && user.is_platform_auditor) {
        // Get the platform auditor role assignment
        const platformAuditorRoleAssignment = await getRequest(
          gatewayAPI`/role_user_assignments/`,
          {
            user: user?.id,
            role_definition: platformAuditorRoleData?.results?.[0]?.id || '',
          }
        );
        // Delete the platform auditor role assignment
        await deleteRequest(
          gatewayAPI`/role_user_assignments/${platformAuditorRoleAssignment?.results?.[0].id?.toString()}/`
        );
      }
      if (user.password) {
        if (confirmPassword !== user.password) {
          setFieldError('confirmPassword', { message: t('Password does not match.') });
          return false;
        }
      }
      user.is_platform_auditor = userType === USER_TYPE_ENUM.Auditor;
      if (!user.is_superuser) {
        const { addedOrganizationIds, removedOrganizationIds } =
          getAddedAndRemovedOrganizationIds(organizations);
        for (const addedOrganizationId of addedOrganizationIds) {
          try {
            await postRequest(gatewayAPI`/role_user_assignments/`, {
              object_id: addedOrganizationId,
              role_definition: organizationMemberRoleData?.results?.[0].id,
              user: user?.id,
            });
          } catch (error) {
            const { genericErrors, fieldErrors } = awxErrorAdapter(error);
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to associate organization with id: {{organizationId}}.', {
                organizationId: addedOrganizationId,
              }),
              timeout: 5000,
              children: (
                <>
                  {genericErrors?.map((err) => err.message)}
                  {fieldErrors?.map((err) => err.message)}
                </>
              ),
            });
          }
        }
        for (const removedOrganizationId of removedOrganizationIds) {
          try {
            const orgMemberRoleAssignment = await getRequest(gatewayAPI`/role_user_assignments/`, {
              user: user?.id,
              role_definition: organizationMemberRoleData?.results?.[0]?.id || '',
            });
            // Delete the organization member role assignment
            await deleteRequest(
              gatewayAPI`/role_user_assignments/${orgMemberRoleAssignment?.results?.[0].id}/`
            );
          } catch (error) {
            const { genericErrors, fieldErrors } = awxErrorAdapter(error);
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to disassociate organization with id: {{organizationId}}.', {
                organizationId: removedOrganizationId,
              }),
              timeout: 5000,
              children: (
                <>
                  {genericErrors?.map((err) => err.message)}
                  {fieldErrors?.map((err) => err.message)}
                </>
              ),
            });
          }
        }
      } else if (user.is_superuser && organizationIds) {
        for (const organizationId of organizationIds) {
          try {
            const orgMemberRoleAssignment = await getRequest(gatewayAPI`/role_user_assignments/`, {
              user: user?.id,
              role_definition: organizationMemberRoleData?.results?.[0]?.id || '',
            });
            // Delete the organization member role assignment
            await deleteRequest(
              gatewayAPI`/role_user_assignments/${orgMemberRoleAssignment?.results?.[0].id}/`
            );
          } catch (error) {
            const { genericErrors, fieldErrors } = awxErrorAdapter(error);
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to disassociate organization with id: {{organizationId}}.', {
                organizationId: organizationId,
              }),
              timeout: 5000,
              children: (
                <>
                  {genericErrors?.map((err) => err.message)}
                  {fieldErrors?.map((err) => err.message)}
                </>
              ),
            });
          }
        }
      }

      user.is_platform_auditor = userType === USER_TYPE_ENUM.Auditor;
      await patchUser(gatewayAPI`/users/${userId.toString()}/`, user);
      pageNavigate(PlatformRoute.UserDetails, { params: { id: user?.id } });
    },
    [
      alertToaster,
      deleteRequest,
      getAddedAndRemovedOrganizationIds,
      getRequest,
      organizationIds,
      organizationMemberRoleData?.results,
      pageNavigate,
      patchUser,
      platformAuditorRoleData?.results,
      t,
      userId,
    ]
  );
  const getPageUrl = useGetPageUrl();

  if (isLoading || isLoadingPlatformAuditorRole) return <LoadingPage breadcrumbs />;
  if (!platformUser) return <PageNotFound />;

  const { password, ...defaultUserValue } = platformUser;
  const defaultValue: Partial<IUserInput> = {
    ...defaultUserValue,
    userType: userTypeFromUser(),
    organizations: orgIds || [],
  };
  return (
    <PageLayout>
      <PageHeader
        title={
          platformUser?.username
            ? t('Edit {{userName}}', { userName: platformUser?.username })
            : t('Users')
        }
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          {
            label: platformUser?.username
              ? t('Edit {{userName}}', { userName: platformUser?.username })
              : t('Users'),
          },
        ]}
      />
      <PageForm<IUserInput>
        submitText={t('Save user')}
        onSubmit={onSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={defaultValue}
      >
        <PlatformUserInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformUserInputs(props: Readonly<{ isCreate?: boolean }>) {
  const { t } = useTranslation();

  const USER_TYPE_OPTIONS = [
    {
      label: t('Normal user'),
      description: t(
        'Has limited read and write access to resources based on assigned roles and permissions.'
      ),
      value: 'normal',
    },
    {
      label: t('Ansible Automation Platform Administrator'),
      description: t(
        'Has full system administration privileges, including comprehensive read and write access across the entire installation.' +
          ' Administrators manage and delegate responsibilities. '
      ),
      value: 'admin',
    },
    {
      label: t('Ansible Automation Platform Auditor'),
      description: t('Has read-only access to all resources within the environment.'),
      value: 'auditor',
    },
  ];

  const { watch } = useFormContext<IUserInput>();
  const isPlatformAdmin = watch('userType') === USER_TYPE_ENUM.Admin;

  return (
    <>
      <PageFormSection>
        <PageFormTextInput<IUserInput>
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
        <PageFormTextInput<IUserInput>
          name="confirmPassword"
          label={t('Confirm password')}
          placeholder={t('Enter password')}
          type="password"
          isRequired={props.isCreate}
        />
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
      </PageFormSection>

      <PageFormSelect
        name="userType"
        label={t('User type')}
        placeholderText={t('Select user type')}
        isRequired
        options={USER_TYPE_OPTIONS}
        labelHelpTitle={t`User type`}
        labelHelp={t(
          `Selecting a user type determines the level of access within Ansible Automation Platform. An Administrator has full access to services and can manage other users. An Auditor has view-only permissions on all objects.`
        )}
      />

      <div style={{ visibility: isPlatformAdmin ? 'hidden' : 'visible' }}>
        <PageFormPlatformOrganizationsSelect name="organizations" />
      </div>
    </>
  );
}
