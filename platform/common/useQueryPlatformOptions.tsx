import { useCallback } from 'react';
import {
  PageAsyncSelectOptionsFn,
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '../../framework/PageInputs/PageAsyncSelectOptions';
import { requestGet } from '../../frontend/common/crud/Data';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';

export function useQueryPlatformOptions<
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
      if (queryOptions.next) {
        url += `&${options.orderQuery}=${queryOptions.next}`;
      }
      if (queryOptions.search) {
        url += `&${options.labelKey as string}__icontains=${queryOptions.search}`;
      }
      const itemsResponse = await requestGet<PlatformItemsResponse<ItemT>>(url);
      const remaining = itemsResponse.count - itemsResponse.results.length;
      const itemOptions = itemsResponse.results.map((item) => {
        return {
          label: item[options.labelKey] as string,
          value: item[options.valueKey] as string,
        };
      });
      const lastItem = itemsResponse.results[itemsResponse.results.length - 1];
      const next = lastItem?.[options.labelKey] as number | string | undefined;
      const result: PageAsyncSelectQueryResult<string> = {
        remaining,
        options: itemOptions,
        next: next ?? '',
      };
      return result;
    },
    [options.labelKey, options.orderQuery, options.url, options.valueKey]
  );
}
