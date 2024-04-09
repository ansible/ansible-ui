import {
  Chip,
  ChipGroup,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { AccessRole, AwxUser } from '../../interfaces/User';
import { AwxRoute } from '../../main/AwxRoutes';

export function useAccessColumns(
  _options?: { disableLinks?: boolean; disableSort?: boolean },
  deleteRole?: (role: AccessRole, user: AwxUser) => void
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<AwxUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={getPageUrl(AwxRoute.UserPage, { params: { id: user.id } })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user) => user.last_name,
        sort: 'last_name',
      },
      {
        header: t('Email'),
        type: 'text',
        value: (user) => user.email,
        sort: 'email',
      },
      {
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
                          onClick={() => deleteRole && deleteRole(role, user)}
                          isReadOnly={!role.user_capabilities.unattach}
                          ouiaId={`${role.name}-${role.id}`}
                          closeBtnAriaLabel={t(`Remove {{roleName}} chip`, { roleName: role.name })}
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
                          onClick={() => deleteRole && deleteRole(role, user)}
                          isReadOnly={!role.user_capabilities.unattach}
                          ouiaId={`team-role-${role.name}-${role.id}`}
                          closeBtnAriaLabel={t(`Remove {{roleName}} chip`, { roleName: role.name })}
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
      },
    ],
    [deleteRole, getPageUrl, t]
  );
  return tableColumns;
}
