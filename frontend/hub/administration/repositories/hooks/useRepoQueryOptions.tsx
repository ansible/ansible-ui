import { useCallback } from 'react';
import { PageAsyncSelectOptionsFn } from '../../../../../framework/PageInputs/PageAsyncSelectOptions';
import { useGetRequest } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { PulpItemsResponse } from '../../../common/useHubView';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';

export function useRepoQueryOptions() {
  const repoRequest = useGetRequest<PulpItemsResponse<Repository>>();
  return useCallback<PageAsyncSelectOptionsFn<string>>(
    ({ next, search }) => {
      const pageSize = 10;
      const page = next ? Number(next) : 1;

      async function load() {
        const query: Record<string, string | number> = {
          offset: pageSize * (page - 1),
          limit: pageSize,
          ordering: 'name',
        };
        if (search) {
          query['name__icontains'] = search;
        }
        const data = await repoRequest(pulpAPI`/repositories/ansible/ansible/`, query);
        return {
          remaining: data.count - (pageSize * (page - 1) + data.results.length),
          options: data.results.map((r) => {
            return { label: r.name, value: r.name };
          }),
          next: page + 1,
        };
      }

      return load();
    },
    [repoRequest]
  );
}
