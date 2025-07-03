import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  Label,
  LabelGroup,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
            text={user?.username}
            to={getPageUrl(AwxRoute.UserDetails, { params: { id: user?.id } })}
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
        value: (user) => user?.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user) => user?.last_name,
        sort: 'last_name',
      },
      {
        header: t('Email'),
        type: 'text',
        value: (user) => user?.email,
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
                    <LabelGroup>
                      {user.user_roles.map((role) => (
                        <Label
                          variant="outline"
                          key={role.id}
                          onClose={() => deleteRole && deleteRole(role, user)}
                          closeBtnAriaLabel={t(`Remove {{roleName}} chip`, { roleName: role.name })}
                        >
                          {role.name}
                        </Label>
                      ))}
                    </LabelGroup>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {user?.team_roles?.length ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Team roles')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelGroup>
                      {user.team_roles.map((role) => (
                        <Label
                          variant="outline"
                          key={role.id}
                          onClose={() => deleteRole && deleteRole(role, user)}
                          closeBtnAriaLabel={t(`Remove {{roleName}} chip`, { roleName: role.name })}
                        >
                          {role.name}
                        </Label>
                      ))}
                    </LabelGroup>
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
