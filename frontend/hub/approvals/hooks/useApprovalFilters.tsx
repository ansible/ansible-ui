import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

import {
  Repository,
  useSelectRepositorySingle,
  useSelectRepositoryMulti,
} from './../../collections/hooks/useRepositorySelector';

export function useApprovalFilters() {
  const { t } = useTranslation();

  const repoSelectorSingle = useSelectRepositorySingle();
  const repoSelectorMulti = useSelectRepositoryMulti();

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
      {
        key: 'repository_name',
        label: t('Repository'),
        type: ToolbarFilterType.AsyncMultiSelect,
        options: [],
        query: 'repository_name',
        limit: 100,
        openSelectDialog: repoSelectorMulti,
        selectionToString: (value: Repository) => value.name,
      },
    ],
    [t]
  );
  return toolbarFilters;
}
