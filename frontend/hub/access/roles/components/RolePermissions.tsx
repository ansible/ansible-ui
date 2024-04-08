import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelsCell } from '../../../../../framework';
import { USER_GROUP_MGMT_PERMISSIONS } from '../../../common/constants';
import { useHubContext } from '../../../common/useHubContext';
import { ModelPermissionsType, Role } from '../Role';

export type PermissionCategory = {
  label: string;
  allPermissions: string[];
  availablePermissions?: string[];
  selectedPermissions?: string[];
};

export function RolePermissions(props: { role: Role; showCustom?: boolean; showEmpty?: boolean }) {
  const { t } = useTranslation();
  const { role, showCustom, showEmpty } = props;
  const { user } = useHubContext();
  const model_permissions = useMemo(() => user?.model_permissions, [user?.model_permissions]);

  const groupsToShow = usePermissionCategories(role?.permissions, showCustom, showEmpty);

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: '12ch',
        sm: '15ch',
        md: '20ch',
        lg: '28ch',
        xl: '30ch',
        '2xl': '35ch',
      }}
    >
      {groupsToShow.length ? null : (
        <DescriptionListGroup data-cy={'permission-categories-no-permissions'}>
          <DescriptionListTerm>{t('No permissions')}</DescriptionListTerm>
        </DescriptionListGroup>
      )}
      {groupsToShow.map((group) => (
        <DescriptionListGroup key={group.label} data-cy={`permission-categories-${group.label}`}>
          <DescriptionListTerm style={{ fontWeight: 'normal' }}>{group.label}</DescriptionListTerm>
          <DescriptionListDescription>
            <LabelsCell
              labels={group.selectedPermissions.map(
                (permission) => model_permissions?.[permission]?.name || permission
              )}
              numLabels={3}
              wrapLabels
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
}

function useKnownPermissionsAndCategories(
  model_permissions?: ModelPermissionsType,
  allPermissions: string[] = Object.keys(model_permissions ?? {})
): PermissionCategory[] {
  return useMemo(() => {
    const categories: { [key: string]: PermissionCategory } = {};

    Object.entries(model_permissions ?? {})
      .filter(([k, _]) => allPermissions.includes(k))
      .forEach(([permission, { ui_category }]) => {
        categories[ui_category] ||= { label: ui_category, allPermissions: [] };
        categories[ui_category].allPermissions.push(permission);
      });

    return Object.values(categories);
  }, [allPermissions, model_permissions]);
}

export function usePermissionCategories(
  permissions: string[] = [],
  showCustom?: boolean,
  showEmpty?: boolean
) {
  const { t } = useTranslation();
  const { user, featureFlags } = useHubContext();
  const model_permissions = useMemo(() => user?.model_permissions, [user?.model_permissions]);

  // show user/group permissions by default
  const userManagementFilter = useCallback(
    (permission: string) =>
      !featureFlags.external_authentication || USER_GROUP_MGMT_PERMISSIONS.includes(permission),
    [featureFlags.external_authentication]
  );
  const allPermissions = useMemo(
    () => Object.keys(model_permissions ?? {}).filter(userManagementFilter),
    [model_permissions, userManagementFilter]
  );
  const groups = useKnownPermissionsAndCategories(model_permissions, allPermissions);
  const allGroups = useMemo(
    () =>
      showCustom
        ? [
            ...groups,
            {
              label: t('Custom permissions'),
              allPermissions: permissions
                .filter(userManagementFilter)
                .filter((permission) => !allPermissions.includes(permission)),
            } as PermissionCategory,
          ]
        : groups,
    [allPermissions, groups, permissions, showCustom, t, userManagementFilter]
  );
  const withActive = useMemo(
    () =>
      allGroups.map((group) => ({
        ...group,
        selectedPermissions: group.allPermissions.filter((permission) =>
          permissions?.includes(permission)
        ),
        availablePermissions: group.allPermissions.filter(
          (permission) => !permissions?.includes(permission)
        ),
      })),
    [allGroups, permissions]
  );
  const groupsToShow = useMemo(
    () => (showEmpty ? withActive : withActive.filter((group) => group.selectedPermissions.length)),
    [showEmpty, withActive]
  );

  return groupsToShow;
}
