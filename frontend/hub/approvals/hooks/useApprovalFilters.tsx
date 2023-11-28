import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { singleSelectBrowseAdapter } from './../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { useSelectRepositorySingle } from './../../repositories/hooks/useRepositorySelector';
import { useRepoQueryOptions } from './../../repositories/hooks/useRepoQueryOptions';

export function useApprovalFilters() {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();

  const repoSelector = singleSelectBrowseAdapter<Repository>(
    useSelectRepositorySingle().onBrowse,
    (item) => item.name,
    (name) => {
      return { name };
    }
  );

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'collection',
        label: t('Collection'),
        type: ToolbarFilterType.Text,
        query: 'name',
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
        key: 'repository',
        label: t('Repository'),
        type: ToolbarFilterType.AsyncSingleSelect,
        query: 'repository_name',
        queryOptions: repoQueryOptions,
        openBrowse: repoSelector,
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.MultiSelect,
        query: 'repository_label',
        options: [
          { label: t('Needs review'), value: `pipeline=staging` },
          { label: t('Approved'), value: `pipeline=approved` },
          { label: t('Rejected'), value: `pipeline=rejected` },
        ],
        placeholder: t('Select statuses'),
      },
    ],
    [t, repoQueryOptions, repoSelector]
  );
  return toolbarFilters;
}
