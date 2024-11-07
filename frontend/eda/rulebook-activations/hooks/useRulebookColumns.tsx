import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useRulebookColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRulebook>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebook) => <TextCell text={rulebook?.name || ''} />,
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );
}
