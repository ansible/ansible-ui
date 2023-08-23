import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useRepoQueryOptions } from './../../repositories/hooks/useRepoQueryOptions';

export function useCollectionFilters() {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();

  return useMemo<IToolbarFilter[]>(() => {
    const filters: IToolbarFilter[] = [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.Text,
        query: 'namespace',
        comparison: 'equals',
      },
      {
        key: 'tags',
        label: t('Tags'),
        type: ToolbarFilterType.Text,
        query: 'tags',
        comparison: 'equals',
      },
      {
        key: 'signature',
        label: t('Signature'),
        type: ToolbarFilterType.MultiSelect,
        query: 'is_signed',
        options: [
          { label: t('Signed'), value: 'true' },
          { label: t('Unsigned'), value: 'false' },
        ],
        placeholder: t('Select signatures'),
      },
      {
        key: 'repository',
        label: t('Repository'),
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'repository_name',
        queryOptions: repoQueryOptions,
      },
    ];
    return filters;
  }, [t]);
}
