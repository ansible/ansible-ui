import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent } from '@patternfly/react-table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelsCell } from '../../../../../framework';
import { USER_GROUP_MGMT_PERMISSIONS } from '../../../common/constants';
import { useHubContext } from '../../../common/useHubContext';
import { ModelPermissionsType, Role } from '../Role';

type PermissionCategories = {
  label: string;
  allPermissions: string[];
  availablePermissions?: string[];
  selectedPermissions?: string[];
};

export function RoleExpandedRow(props: { role: Role; showCustom?: boolean; showEmpty?: boolean }) {
  const { t } = useTranslation();
  const { role, showCustom, showEmpty } = props;
  const { user, featureFlags } = useHubContext();
  const model_permissions = useMemo(() => user.model_permissions, [user.model_permissions]);

  // show user/group permissions by default
  const userManagementFilter = useCallback(
    (permission: string) =>
      !featureFlags.external_authentication || USER_GROUP_MGMT_PERMISSIONS.includes(permission),
    [featureFlags.external_authentication]
  );
  const allPermissions = useMemo(
    () => Object.keys(model_permissions).filter(userManagementFilter),
    [model_permissions, userManagementFilter]
  );
  const groups = useKnownPermissionsAndCategories(model_permissions, allPermissions);
  const allGroups = useMemo(
    () =>
      showCustom
        ? [
            ...groups,
            {
              label: t`Custom permissions`,
              allPermissions: role.permissions
                .filter(userManagementFilter)
                .filter((permission) => !allPermissions.includes(permission)),
            } as PermissionCategories,
          ]
        : groups,
    [allPermissions, groups, role.permissions, showCustom, t, userManagementFilter]
  );
  const withActive = useMemo(
    () =>
      allGroups.map((group) => ({
        ...group,
        selectedPermissions: group.allPermissions.filter(
          (permission) => role.permissions?.includes(permission)
        ),
        availablePermissions: group.allPermissions.filter(
          (permission) => !role.permissions?.includes(permission)
        ),
      })),
    [allGroups, role.permissions]
  );
  const groupsToShow = useMemo(
    () => (showEmpty ? withActive : withActive.filter((group) => group.selectedPermissions.length)),
    [showEmpty, withActive]
  );

  return (
    <ExpandableRowContent>
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
            <DescriptionListTerm>{group.label}</DescriptionListTerm>
            <DescriptionListDescription>
              <LabelsCell
                labels={group.selectedPermissions.map(
                  (permission) => model_permissions[permission]?.name || permission
                )}
                numLabels={3}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </ExpandableRowContent>
  );
}

function useKnownPermissionsAndCategories(
  model_permissions: ModelPermissionsType,
  allPermissions: string[] = Object.keys(model_permissions)
): PermissionCategories[] {
  return useMemo(() => {
    const categories: { [key: string]: PermissionCategories } = {};

    Object.entries(model_permissions)
      .filter(([k, _]) => allPermissions.includes(k))
      .forEach(([permission, { ui_category }]) => {
        categories[ui_category] ||= { label: ui_category, allPermissions: [] };
        categories[ui_category].allPermissions.push(permission);
      });

    return Object.values(categories);
  }, [allPermissions, model_permissions]);
}
