import {
  PageAsyncSelectOptionsFn,
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { useCallback } from 'react';
import { requestGet } from '../../../common/crud/Data';
import { EdaItemsResponse } from '../../common/EdaItemsResponse';

export function useQueryProjectOptions<
  ItemT extends object,
  LabelKey extends keyof ItemT,
  ValueKey extends keyof ItemT,
>(options: {
  url: string;
  labelKey: LabelKey;
  valueKey: ValueKey;
  orderQuery: string;
}): PageAsyncSelectOptionsFn<string> {
  return useCallback(
    async (queryOptions: PageAsyncSelectQueryOptions) => {
      let url = options.url;
      url += `?${options.orderQuery}=${options.labelKey as string}`;
      if (queryOptions.search) {
        url += `&${options.labelKey as string}__icontains=${queryOptions.search}`;
      }
      if (queryOptions.next) {
        url += `&${options.orderQuery}=${queryOptions.next}`;
      }
      const response = await requestGet<EdaItemsResponse<ItemT>>(url);
      const rest = response.count - response.results.length;
      const itemOptions = response.results.map((item) => {
        return {
          label: item[options.labelKey] as string,
          value: item[options.valueKey] as string,
        };
      });
      const lastItem = response.results[response.results.length - 1];
      const next = lastItem?.[options.labelKey] as number | string | undefined;
      const result: PageAsyncSelectQueryResult<string> = {
        remaining: rest,
        options: itemOptions,
        next: next ?? '',
      };
      return result;
    },
    [options.labelKey, options.orderQuery, options.url, options.valueKey]
  );
}
