import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useGetRequest } from '../../../common/crud/useGet';
import { PageAsyncSingleSelectOptionsFn } from './../../../../framework/PageInputs/PageAsyncSingleSelect';
import { pulpAPI } from './../../api';
import { PulpItemsResponse } from './../../usePulpView';
import { useSelectRepositorySingle } from './../../repositories/hooks/useRepositorySelector';
import { selectedToString } from './../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';

import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';

export function useApprovalFilters() {
  const { t } = useTranslation();
  const repoRequest = useGetRequest<PulpItemsResponse<Repository>>();

  const repoSelector = selectedToString<Repository>(
    useSelectRepositorySingle(),
    (item) => item.name,
    (name) => {
      return { name };
    }
  );

  const repoQueryOptions: PageAsyncSingleSelectOptionsFn<string> = useCallback(
    (page) => {
      const pageSize = 10;

      async function load() {
        const data = await repoRequest(pulpAPI`/repositories/ansible/ansible/`, {
          offset: pageSize * (page - 1),
          limit: pageSize,
        });
        return {
          total: data.count,
          options: data.results.map((r) => {
            return { label: r.name, value: r.name };
          }),
        };
      }

      return load();
    },
    [repoRequest]
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
    [t, repoQueryOptions]
  );
  return toolbarFilters;
}
