import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { Role } from '../Role';
import { PageFormRolePermissionsSelect } from '../components/PageFormPermissionsSelect';
import { HubRoute } from '../../../main/HubRoutes';
import { HubPageForm } from '../../../common/HubPageForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useGet } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { PermissionCategory, usePermissionCategories } from '../components/RolePermissions';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { useIsValidRoleName } from '../hooks/useIsValidRoleName';
import { useIsValidRoleDescription } from '../hooks/useIsValidRoleDescription';
import { usePatchRequest } from '../../../../common/crud/usePatchRequest';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubError } from '../../../common/HubError';
import { PulpItemsResponse } from '../../../common/useHubView';

export interface RoleInput extends Omit<Role, 'pulp_href' | 'pulp_created' | 'locked'> {
  permissionCategories: PermissionCategory[];
}

export type RoleRequestBody = Omit<Role, 'pulp_href' | 'pulp_created' | 'locked'>;

export function CreateRole() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<RoleRequestBody>();
  const onSubmit: PageFormSubmitHandler<RoleInput> = async (values) => {
    const { name, description, permissionCategories } = values;
    const permissions = getSelectedPermissions(permissionCategories);
    const role = await postRequest(pulpAPI`/roles/`, {
      name,
      description,
      permissions,
    });
    pageNavigate(HubRoute.RoleDetails, { params: { id: role.name } });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Role')}
        breadcrumbs={[
          { label: t('Roles'), to: getPageUrl(HubRoute.Roles) },
          { label: t('Create Role') },
        ]}
      />
      <HubPageForm<RoleInput>
        submitText={t('Create role')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{ name: '', description: '', permissions: [] }}
      >
        <RoleInputs mode={'create'} />
      </HubPageForm>
    </PageLayout>
  );
}

export function EditRole() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<PulpItemsResponse<Role>>(
    pulpAPI`/roles/?name=${params.id}`
  );
  const role = data?.results?.[0];
  const permissionCategories = usePermissionCategories(role?.permissions, false, true);
  const patchRequest = usePatchRequest<RoleRequestBody, Role>();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  const onSubmit: PageFormSubmitHandler<RoleInput> = async (values) => {
    const { name, description, permissionCategories } = values;
    const permissions = getSelectedPermissions(permissionCategories);
    await patchRequest(pulpAPI`/roles/${parsePulpIDFromURL(role?.pulp_href)}/`, {
      name,
      description,
      permissions,
    });
    pageNavigate(HubRoute.RoleDetails, { params: { id: role.name } });
  };

  if (!role) {
    return (
      <PageLayout>
        <PageHeader
          title={t('Edit Role')}
          breadcrumbs={[
            { label: t('Roles'), to: getPageUrl(HubRoute.Roles) },
            { label: t('Edit Role') },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Role')}
        breadcrumbs={[
          { label: t('Roles'), to: getPageUrl(HubRoute.Roles) },
          { label: t('Edit Role') },
        ]}
      />
      <HubPageForm<RoleInput>
        submitText={t('Save role')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{
          name: role.name,
          description: role.description,
          permissionCategories: permissionCategories,
          permissions: role.permissions,
        }}
      >
        <RoleInputs permissions={role.permissions} mode={'edit'} />
      </HubPageForm>
    </PageLayout>
  );
}

export function RoleInputs(props: { permissions?: string[]; mode: 'edit' | 'create' }) {
  const { t } = useTranslation();
  const isValidRoleName = useIsValidRoleName();
  const isValidRoleDescription = useIsValidRoleDescription();
  return (
    <>
      <PageFormTextInput
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        validate={isValidRoleName}
        isReadOnly={props.mode === 'edit'}
      />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
        isRequired
        validate={isValidRoleDescription}
      />

      <PageFormSection title={t('Permissions')} singleColumn isHorizontal>
        <PageFormRolePermissionsSelect permissions={props.permissions} />
      </PageFormSection>
    </>
  );
}

/**
 * Hook that accepts categorized permissions and returns a
 * flattened list of permissions
 */
function getSelectedPermissions(permissionCategories: PermissionCategory[]) {
  return permissionCategories.reduce((accumulatedPermissions, currentVal) => {
    if (currentVal.selectedPermissions) {
      accumulatedPermissions.push(...currentVal.selectedPermissions);
    }
    return accumulatedPermissions;
  }, [] as string[]);
}
