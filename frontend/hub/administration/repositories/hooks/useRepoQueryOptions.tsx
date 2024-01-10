import { useCallback } from 'react';
import { PageAsyncSingleSelectOptionsFn } from '../../../../../framework/PageInputs/PageAsyncSingleSelect';
import { useGetRequest } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { PulpItemsResponse } from '../../../common/useHubView';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';

export function useRepoQueryOptions() {
  const repoRequest = useGetRequest<PulpItemsResponse<Repository>>();
  return useCallback(
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
  ) as PageAsyncSingleSelectOptionsFn<string>;
}
