import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useRepoQueryOptions } from '../../administration/repositories/hooks/useRepoQueryOptions';

import { useSelectRepositorySingle } from '../../administration/repositories/hooks/useRepositorySelector';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { singleSelectBrowseAdapter } from './../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';

export function useCollectionFilters() {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();
  const selectRepositorySingle = useSelectRepositorySingle();

  const repoSelector = singleSelectBrowseAdapter<Repository>(
    selectRepositorySingle.openBrowse,
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
        type: ToolbarFilterType.SingleText,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.SingleText,
        query: 'namespace',
        comparison: 'equals',
      },
      {
        key: 'tags',
        label: t('Tags'),
        type: ToolbarFilterType.SingleText,
        query: 'tags',
        comparison: 'equals',
      },
      {
        key: 'signature',
        label: t('Signature'),
        type: ToolbarFilterType.SingleSelect,
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
        type: ToolbarFilterType.AsyncSingleSelect,
        query: 'repository_name',
        queryOptions: repoQueryOptions,
        openBrowse: repoSelector,
        queryLabel: (value) => value,
        placeholder: t('Select repositories'),
      },
    ];
    return filters;
  }, [t, repoQueryOptions, repoSelector]);
}
