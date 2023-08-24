import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { AccessRole, User } from '../../../interfaces/User';
import { Chip, ChipGroup } from '@patternfly/react-core';
import { RouteObj } from '../../../../common/Routes';

export function useAccessListColumns(
  setIsOpen: (isOpen: boolean) => void,
  setUser: (user: User) => void,
  setRole: (role: AccessRole) => void
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useMemo<ITableColumn<User>[]>(
    () => [
      {
        header: t('Username'),
        sort: 'username',
        cell: (user) => (
          <TextCell
            text={user.username}
            onClick={() => navigate(RouteObj.UserPage.replace(':id', user.id.toString()))}
          />
        ),
      },
      {
        header: t('First name'),
        sort: 'first_name',

        cell: (user) => user.first_name,
      },
      {
        header: t('Last name'),
        sort: 'last_name',
        cell: (user) => user.last_name,
      },
      {
        header: t('Roles'),
        cell: (user) => (
          <>
            <ChipGroup categoryName={t('User roles')}>
              {user.summary_fields.direct_access?.map((access) => (
                <Chip
                  onClick={() => {
                    setIsOpen(true);
                    setUser(user);
                    setRole(access.role);
                  }}
                  key={access.role.id}
                >
                  {access.role.name}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup categoryName={t('Team roles')}>
              {user.summary_fields.indirect_access?.map((access) => (
                <Chip
                  onClick={() => {
                    setIsOpen(true);
                    setUser(user);
                    setRole(access.role);
                  }}
                  key={access.role.id}
                >
                  {access.role.name}
                </Chip>
              ))}
            </ChipGroup>
          </>
        ),
      },
    ],
    [navigate, setIsOpen, setUser, setRole, t]
  );
  return tableColumns;
}
