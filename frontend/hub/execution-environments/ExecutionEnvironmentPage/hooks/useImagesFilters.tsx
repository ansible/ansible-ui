import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useImagesFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'tag',
        label: t('Tag'),
        type: ToolbarFilterType.SingleText,
        query: 'tag',
        placeholder: t('Filter by tag'),
        comparison: 'contains',
      },
      {
        key: 'digest',
        label: t('Digest'),
        type: ToolbarFilterType.SingleText,
        query: 'digest__contains',
        placeholder: t('Filter by digest'),
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
