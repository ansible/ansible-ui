import { Checkbox, Tooltip } from '@patternfly/react-core';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  LoadingPage,
  PFColorE,
  PageForm,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  getPatternflyColor,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { awxErrorAdapter } from '../../../../frontend/awx/common/adapters/awxErrorAdapter';
import { UserAssignment } from '../../../../frontend/common/access/interfaces/UserAssignment';
import { postRequest } from '../../../../frontend/common/crud/Data';
import { useDeleteRequest } from '../../../../frontend/common/crud/useDeleteRequest';
import { useGet, useGetRequest } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import {
  useHasAwxService,
  useHasEdaService,
  useHasHubService,
} from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PageFormPlatformOrganizationsSelect } from '../../organizations/components/PageFormPlatformOrganizationsSelect';
import { useGetOrganizationsForUser } from '../hooks/useGetOrganizationsForUser';
import { useGetPlatformAndServiceUsers } from '../hooks/useGetPlatformAndServiceUsers';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

const ServiceAdminCheckbox = styled(PageFormCheckbox)`
  margin-bottom: 8px;
`;

export type IUserInput = PlatformUser & {
  confirmPassword: string;
  organizations: number[];
  platformAdmin: boolean;
  platformAuditor: boolean;
  awxAdmin: boolean;
  hubAdmin: boolean;
  edaAdmin: boolean;
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
    const createdUser = await postUserRequest(gatewayAPI`/users/`, user);
    if (platformAuditor) {
      await postRequest(gatewayAPI`/role_user_assignments/`, {
        user: createdUser.id,
        role_definition: platformAuditorRoleData?.results?.[0]?.id,
        object_id: null,
      });
    }
    if (organizations) {
      for (const orgId of organizations) {
        try {
          await postRequest(gatewayAPI`/organizations/${orgId.toString() ?? ''}/users/associate/`, {
            instances: [createdUser.id],
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
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const alertToaster = usePageAlertToaster();
  const userId = Number(params.id);

  const { awxUser, edaUser, hubUser, platformUser, isLoading, error, updateServiceUserSuperuser } =
    useGetPlatformAndServiceUsers(userId);
  const { orgIds, getAddedAndRemovedOrganizationIds } = useGetOrganizationsForUser(userId);
  const { data: platformAuditorRoleData, isLoading: isLoadingPlatformAuditorRole } = useGet<
    PlatformItemsResponse<PlatformRole>
  >(gatewayAPI`/role_definitions/`, {
    name: 'Platform Auditor',
  });

  const patchUser = usePatchRequest<PlatformUser, PlatformUser>();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();

  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayAPI`/users/${userId?.toString() ?? ''}/organizations/`
  );
  const organizationIds = organizationsData?.results.map((organization) => organization.id) ?? [];

  const onSubmit: PageFormSubmitHandler<IUserInput> = useCallback(
    async (userInput: IUserInput, setError, setFieldError) => {
      const {
        confirmPassword,
        organizations,
        platformAdmin,
        platformAuditor,
        awxAdmin,
        edaAdmin,
        hubAdmin,
        ...user
      } = userInput;
      user.is_superuser = platformAdmin;

      await updateServiceUserSuperuser({ userInput, awxUser, edaUser, hubUser });

      if (platformAuditor && !user.is_platform_auditor) {
        await postRequest(gatewayAPI`/role_user_assignments/`, {
          user: user.id,
          role_definition: platformAuditorRoleData?.results?.[0]?.id,
          object_id: null,
        });
      } else if (!platformAuditor && user.is_platform_auditor) {
        // Get the platform auditor role assignment
        const platformAuditorRoleAssignment = await getRequest(
          gatewayAPI`/role_user_assignments/`,
          {
            user: user.id,
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
      user.is_platform_auditor = platformAuditor;
      if (!user.is_superuser) {
        const { addedOrganizationIds, removedOrganizationIds } =
          getAddedAndRemovedOrganizationIds(organizations);
        for (const addedOrganizationId of addedOrganizationIds) {
          try {
            await postRequest(
              gatewayAPI`/organizations/${addedOrganizationId.toString() ?? ''}/users/associate/`,
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
              gatewayAPI`/organizations/${removedOrganizationId.toString() ?? ''}/users/disassociate/`,
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
      } else if (user.is_superuser && organizationIds) {
        for (const organizationId of organizationIds) {
          try {
            await postRequest(
              gatewayAPI`/organizations/${organizationId.toString() ?? ''}/users/disassociate/`,
              {
                instances: [user.id],
              }
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

      user.is_platform_auditor = platformAuditor;
      await patchUser(gatewayAPI`/users/${userId.toString()}/`, user);
      pageNavigate(PlatformRoute.UserDetails, { params: { id: user.id } });
    },
    [
      alertToaster,
      awxUser,
      deleteRequest,
      edaUser,
      getAddedAndRemovedOrganizationIds,
      getRequest,
      hubUser,
      pageNavigate,
      patchUser,
      platformAuditorRoleData?.results,
      t,
      updateServiceUserSuperuser,
      userId,
    ]
  );
  const getPageUrl = useGetPageUrl();

  if (isLoading || isLoadingPlatformAuditorRole) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!platformUser) return <PageNotFound />;

  const { password, ...defaultUserValue } = platformUser;
  const defaultValue: Partial<IUserInput> = {
    ...defaultUserValue,
    platformAdmin: Boolean(platformUser.is_superuser),
    platformAuditor: Boolean(platformUser.is_platform_auditor),
    organizations: orgIds || [],
    awxAdmin: Boolean(awxUser?.is_superuser) || Boolean(platformUser?.is_superuser),
    edaAdmin: Boolean(edaUser?.is_superuser) || Boolean(platformUser?.is_superuser),
    hubAdmin: Boolean(hubUser?.is_superuser) || Boolean(platformUser?.is_superuser),
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
  const { setValue, watch } = useFormContext<IUserInput>();
  const isPlatformAdmin = watch('platformAdmin');

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
          {props.isCreate ? (
            <PageFormCheckbox
              label={t`Ansible Automation Platform Administrator`}
              name="platformAdmin"
            />
          ) : (
            <AdminCheckboxes />
          )}
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

      {!isPlatformAdmin ? (
        <PageFormSection singleColumn>
          <PageFormPlatformOrganizationsSelect name="organizations" />
        </PageFormSection>
      ) : null}
    </>
  );
}

function AdminCheckboxes() {
  const { t } = useTranslation();
  const { control, setValue, watch } = useFormContext<IUserInput>();

  const hasAwxService = useHasAwxService();
  const hasEdaService = useHasEdaService();
  const hasHubService = useHasHubService();

  const awxAdmin = watch('awxAdmin');
  const hubAdmin = watch('hubAdmin');
  const edaAdmin = watch('edaAdmin');

  const allEnabledSubServicesChecked = useMemo(
    () =>
      (!hasAwxService || awxAdmin) && (!hasHubService || hubAdmin) && (!hasEdaService || edaAdmin),
    [awxAdmin, hubAdmin, edaAdmin, hasAwxService, hasHubService, hasEdaService]
  );

  useEffect(() => {
    setValue('platformAdmin', allEnabledSubServicesChecked);
  }, [setValue, allEnabledSubServicesChecked]);

  const handlePlatformAdminChange = useCallback(
    (val: boolean) => {
      if (val) {
        hasAwxService && setValue('awxAdmin', true);
        hasHubService && setValue('hubAdmin', true);
        hasEdaService && setValue('edaAdmin', true);
      } else {
        hasAwxService && setValue('awxAdmin', false);
        hasHubService && setValue('hubAdmin', false);
        hasEdaService && setValue('edaAdmin', false);
      }
      setValue('platformAdmin', val);
    },
    [hasAwxService, hasHubService, hasEdaService, setValue]
  );

  return (
    <Controller
      name="platformAdmin"
      control={control}
      shouldUnregister
      render={({ field: { value }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message;
        return (
          <Checkbox
            name="platformAdmin"
            id={'platform-admin-checkbox'}
            data-cy={'platform-admin-checkbox'}
            aria-label={t`Ansible Automation Platform Administrator`}
            label={
              <div style={{ display: 'flex' }}>
                <div>{t`Ansible Automation Platform Administrator`}</div>
              </div>
            }
            description={
              helperTextInvalid ?? (
                <span style={{ color: getPatternflyColor(PFColorE.Danger) }}>
                  {helperTextInvalid}
                </span>
              )
            }
            isChecked={Boolean(value)}
            onChange={(_event, val) => handlePlatformAdminChange(val)}
            body={
              <>
                <ServiceAdminCheckbox
                  label={t`Automation Execution Administrator`}
                  name="awxAdmin"
                  isDisabled={Boolean(hasAwxService) === false}
                />
                <ServiceAdminCheckbox
                  label={t`Automation Decisions Administrator`}
                  name="edaAdmin"
                  isDisabled={Boolean(hasEdaService) === false}
                />
                <ServiceAdminCheckbox
                  label={t`Automation Content Administrator`}
                  name="hubAdmin"
                  isDisabled={Boolean(hasHubService) === false}
                />
              </>
            }
          />
        );
      }}
    />
  );
}
