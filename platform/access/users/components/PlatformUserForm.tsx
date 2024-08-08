import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { Tooltip } from '@patternfly/react-core';
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
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { postRequest } from '../../../../frontend/common/crud/Data';
import { useGet, useGetRequest } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PageFormPlatformOrganizationsSelect } from '../../organizations/components/PageFormPlatformOrganizationsSelect';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { UserAssignment } from '../../../../frontend/common/access/interfaces/UserAssignment';
import { useDeleteRequest } from '../../../../frontend/common/crud/useDeleteRequest';
import { awxErrorAdapter } from '../../../../frontend/awx/common/adapters/awxErrorAdapter';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

type IUserInput = PlatformUser & {
  confirmPassword: string;
  organizations: number[];
  platformAdmin: boolean;
  platformAuditor: boolean;
};

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const alertToaster = usePageAlertToaster();
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
    const { confirmPassword, organizations, platformAdmin, platformAuditor, ...user } = userInput;
    user.is_superuser = platformAdmin;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const createdUser = await postUserRequest(gatewayV1API`/users/`, user);
    if (platformAuditor) {
      await postRequest(gatewayV1API`/role_user_assignments/`, {
        user: createdUser.id,
        role_definition: platformAuditorRoleData?.results?.[0]?.id,
        object_id: null,
      });
    }
    if (organizations) {
      for (const orgId of organizations) {
        try {
          await postRequest(
            gatewayV1API`/organizations/${orgId.toString() ?? ''}/users/associate/`,
            {
              instances: [createdUser.id],
            }
          );
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
    platformAdmin: false,
    platformAuditor: false,
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
  const alertToaster = usePageAlertToaster();
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
  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayV1API`/users/${user?.id?.toString() ?? ''}/organizations/`
  );
  const patchUser = usePatchRequest<PlatformUser, PlatformUser>();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();
  const getAddedAndRemovedOrganizationIds = useCallback(
    (updatedOrgIds: number[]) => {
      const addedOrganizationIds: number[] = [];
      const removedOrganizationIds: number[] = [];
      if (!organizationsData?.results?.length) {
        addedOrganizationIds.push(...updatedOrgIds);
      } else {
        for (const updatedOrgId of updatedOrgIds) {
          if (
            !organizationsData?.results?.some((org) => org.id === updatedOrgId) &&
            !addedOrganizationIds?.some(
              (addedOrganizationId) => addedOrganizationId === updatedOrgId
            )
          ) {
            addedOrganizationIds.push(updatedOrgId);
          }
        }
        for (const organization of organizationsData.results) {
          if (
            !updatedOrgIds.some((updatedOrgId) => updatedOrgId === organization.id) &&
            !removedOrganizationIds.some(
              (removedOrganizationId) => removedOrganizationId === organization.id
            )
          ) {
            removedOrganizationIds.push(organization.id);
          }
        }
      }
      return {
        addedOrganizationIds,
        removedOrganizationIds,
      };
    },
    [organizationsData?.results]
  );
  const orgIds = useMemo(
    () => organizationsData?.results?.map((organization) => organization.id),
    [organizationsData?.results]
  );

  const onSubmit: PageFormSubmitHandler<IUserInput> = useCallback(
    async (userInput: IUserInput, setError, setFieldError) => {
      const { confirmPassword, organizations, platformAdmin, platformAuditor, ...user } = userInput;
      user.is_superuser = platformAdmin;
      if (platformAuditor && !user.is_platform_auditor) {
        await postRequest(gatewayV1API`/role_user_assignments/`, {
          user: user.id,
          role_definition: platformAuditorRoleData?.results?.[0]?.id,
          object_id: null,
        });
      } else if (!platformAuditor && user.is_platform_auditor) {
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
      user.is_platform_auditor = platformAuditor;
      const { addedOrganizationIds, removedOrganizationIds } =
        getAddedAndRemovedOrganizationIds(organizations);
      for (const addedOrganizationId of addedOrganizationIds) {
        try {
          await postRequest(
            gatewayV1API`/organizations/${addedOrganizationId.toString() ?? ''}/users/associate/`,
            {
              instances: [user.id],
            }
          );
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
          await postRequest(
            gatewayV1API`/organizations/${removedOrganizationId.toString() ?? ''}/users/disassociate/`,
            {
              instances: [user.id],
            }
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
      user.is_platform_auditor = platformAuditor;
      await patchUser(gatewayV1API`/users/${id.toString()}/`, user);
      navigate(-1);
    },
    [
      alertToaster,
      deleteRequest,
      getAddedAndRemovedOrganizationIds,
      getRequest,
      id,
      navigate,
      patchUser,
      platformAuditorRoleData?.results,
      t,
    ]
  );
  const getPageUrl = useGetPageUrl();

  if (isLoading || isLoadingPlatformAuditorRole) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!user) return <PageNotFound />;

  const { password, ...defaultUserValue } = user;
  const defaultValue: Partial<IUserInput> = {
    ...defaultUserValue,
    platformAdmin: Boolean(user.is_superuser),
    platformAuditor: Boolean(user.is_platform_auditor),
    organizations: orgIds || [],
  };

  return (
    <PageLayout>
      <PageHeader
        title={user?.username ? t('Edit {{userName}}', { userName: user?.username }) : t('Users')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          {
            label: user?.username
              ? t('Edit {{userName}}', { userName: user?.username })
              : t('Users'),
          },
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
  const { setValue } = useFormContext<IUserInput>();

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

      <PageFormSection singleColumn>
        <PageFormGroup
          fieldId="test"
          label={t('User type')}
          labelHelpTitle={t`User type`}
          labelHelp={t`Selecting a user type determines the level of access within Ansible Automation Platform. An Administrator has full access to services and can manage other users. An Auditor has view-only permissions on all objects.`}
        >
          <PageFormCheckbox
            label={t`Ansible Automation Platform Administrator`}
            name="platformAdmin"
          />
          <PageFormWatch watch="platformAdmin">
            {(platformAdmin) => {
              if (platformAdmin === true) {
                setValue(`platformAuditor`, false);
              }
              const checkbox = (
                <PageFormCheckbox
                  label={t`Ansible Automation Platform Auditor`}
                  name="platformAuditor"
                  isDisabled={platformAdmin === true}
                />
              );
              return platformAdmin ? (
                <Tooltip
                  content={t`The Platform Auditor option is disabled when Platform Administrator is selected, as Platform Administrator includes all Platform Auditor permissions.`}
                  position="top-start"
                >
                  {checkbox}
                </Tooltip>
              ) : (
                checkbox
              );
            }}
          </PageFormWatch>
        </PageFormGroup>
      </PageFormSection>

      <PageFormSection singleColumn>
        <PageFormPlatformOrganizationsSelect name="organizations" />
      </PageFormSection>
    </>
  );
}
