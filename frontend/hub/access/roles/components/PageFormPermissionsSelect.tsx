import { useTranslation } from 'react-i18next';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { RoleInput } from '../RolePage/RoleForm';
import { usePermissionCategories } from './RolePermissions';
import { useHubContext } from '../../../common/useHubContext';
import { useMemo } from 'react';

export function PageFormRolePermissionsSelect(props: { permissions?: string[] }) {
  const { t } = useTranslation();
  const { user } = useHubContext();
  const model_permissions = useMemo(() => user.model_permissions, [user.model_permissions]);
  const permissionCategories = usePermissionCategories(props.permissions, false, true);

  return (
    <>
      {permissionCategories?.map((permissionCategory, index) => (
        <PageFormMultiSelect<RoleInput>
          name={`permissionCategories.${index}.selectedPermissions`}
          key={permissionCategory.label}
          label={permissionCategory.label}
          options={
            permissionCategory?.allPermissions
              ? permissionCategory.allPermissions.map((permission) => ({
                  label: model_permissions[permission]?.name || permission,
                  value: permission,
                }))
              : []
          }
          placeholder={t('Select permissions')}
        />
      ))}
    </>
  );
}
