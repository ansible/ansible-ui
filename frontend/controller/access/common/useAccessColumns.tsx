import {
  ChipGroup,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useUsersColumns } from '../users/hooks/useUsersColumns';

export function useAccessColumns() {
  const tableColumns = useUsersColumns();
  const { t } = useTranslation();

  tableColumns.splice(1, 1);
  tableColumns.splice(4, 1);

  tableColumns.push({
    header: t('Roles'),
    cell: (user) => {
      return (
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '8ch',
          }}
        >
          {user?.user_roles?.length ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('User roles')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ChipGroup>
                  {user.user_roles.map((role) => (
                    <Chip
                      key={role.id}
                      onClick={() => deleteRole(role, user)}
                      isReadOnly={!role.user_capabilities.unattach}
                      ouiaId={`${role.name}-${role.id}`}
                      closeBtnAriaLabel={t`Remove ${role.name} chip`}
                    >
                      {role.name}
                    </Chip>
                  ))}
                </ChipGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          {user?.team_roles?.length ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Team roles')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ChipGroup>
                  {user.team_roles.map((role) => (
                    <Chip
                      key={role.id}
                      onClick={() => deleteRole(role, user)}
                      isReadOnly={!role.user_capabilities.unattach}
                      ouiaId={`team-role-${role.name}-${role.id}`}
                      closeBtnAriaLabel={t`Remove ${role.name} chip`}
                    >
                      {role.name}
                    </Chip>
                  ))}
                </ChipGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      );
    },
  });
}
