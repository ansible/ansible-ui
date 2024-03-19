import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { singleSelectBrowseAdapter } from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { useRepoQueryOptions } from '../../repositories/hooks/useRepoQueryOptions';
import { useSelectRepositorySingle } from '../../repositories/hooks/useRepositorySelector';

export function useApprovalFilters() {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();

  const repoSelector = singleSelectBrowseAdapter<Repository>(
    useSelectRepositorySingle().openBrowse,
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
        type: ToolbarFilterType.SingleText,
        query: 'name',
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
        key: 'repository',
        label: t('Repository'),
        type: ToolbarFilterType.AsyncSingleSelect,
        query: 'repository_name',
        queryOptions: repoQueryOptions,
        openBrowse: repoSelector,
        queryLabel: (value) => value,
        placeholder: t('Select repositories'),
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.SingleSelect,
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
