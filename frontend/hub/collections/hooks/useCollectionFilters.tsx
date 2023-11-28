import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useRepoQueryOptions } from './../../repositories/hooks/useRepoQueryOptions';

import { multiSelectBrowseAdapter } from './../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncMultiSelectFilter';
import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { useSelectRepositoryMulti } from './../../repositories/hooks/useRepositorySelector';

export function useCollectionFilters() {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();
  const selectRepositoryMulti = useSelectRepositoryMulti();

  const repoSelector = multiSelectBrowseAdapter<Repository>(
    selectRepositoryMulti.onBrowse,
    (item) => item.name,
    (name) => {
      return { name };
    }
  );

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
        openBrowse: repoSelector,
      },
    ];
    return filters;
  }, [t, repoQueryOptions, repoSelector]);
}
