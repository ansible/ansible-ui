import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
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
        cell: (token: EdaControllerToken) =>
          token.created_at && <DateTimeCell value={token.created_at} />,
        value: (token) => token.created_at,
        modal: ColumnModalOption.hidden,
      },
    ],
    [t]
  );
}
