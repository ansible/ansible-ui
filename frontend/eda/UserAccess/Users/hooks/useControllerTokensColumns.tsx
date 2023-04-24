import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, ITableColumn, TextCell } from '../../../../../framework';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';

export function useControllerTokensColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaControllerToken>[]>(
    () => [
      {
        header: t('Name'),
        cell: (token) => <TextCell text={token?.name} />,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (token) => token.description && <TextCell text={token.description} />,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (token) => token.created_at,
        modal: ColumnModalOption.Hidden,
      },
    ],
    [t]
  );
}
