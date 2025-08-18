import { ITableColumn, LabelsCell, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useOrganizationUserColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<UserRoleAccess>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user?.username}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.UserDetails, { params: { id: user?.id } })
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
        defaultSort: true,
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
        header: t('Organization roles'),
        cell: (item: UserRoleAccess) => (
          <LabelsCell
            labels={item?.object_role_assignments?.map((obj) => obj.role_definition?.name)}
          />
        ),
      },
    ],
    [getPageUrl, options?.disableLinks, t]
  );
  return tableColumns;
}
