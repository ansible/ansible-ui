import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaRole } from '../../../interfaces/EdaRole';

export function useRoleColumns(withLinks: boolean) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) =>
          withLinks ? (
            <TextCell
              text={role.name}
              to={RouteObj.EdaRoleDetails.replace(':id', role.id.toString())}
            />
          ) : (
            <TextCell text={role.name} />
          ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (role) => role.description && <TextCell text={role.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [withLinks, t]
  );
}
