import { useTranslation } from 'react-i18next';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { RoleInput } from '../RolePage/RoleForm';
import { usePermissionCategories } from './RolePermissions';

export function PageFormRolePermissionsSelect() {
  const permissionCategories = usePermissionCategories();
  const { t } = useTranslation();

  return (
    <PageFormMultiSelect<RoleInput>
      name="roles"
      label={t('Permissions(')}
      options={
        permissionCategories?.availablePermissions
          ? userRoles.results.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          : []
      }
      isRequired
      placeholder={t('Select role(s)')}
    />
  );
}
