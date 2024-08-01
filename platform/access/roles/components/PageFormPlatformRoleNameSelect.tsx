import { useCallback } from 'react';
import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import {
  PageAsyncSelectOptionsFn,
  PageAsyncSelectQueryResult,
} from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PageAsyncSelectQueryOptions } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

export function PageFormPlatformRoleNameSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: { name: TFieldName; contentType?: string | null; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryRoleOptions(props.contentType);

  return (
    <PageFormAsyncSingleSelect<TFieldValues, TFieldName>
      name={props.name}
      id="role"
      label={t('Role')}
      placeholder={t('Select role')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading role...')}
      queryErrorText={t('Error loading roles')}
      queryLabel={(name: string) => name}
      isRequired={props.isRequired}
    />
  );
}

function useQueryRoleOptions(contentType?: string | null): PageAsyncSelectOptionsFn<string> {
  return useCallback(
    async (queryOptions: PageAsyncSelectQueryOptions) => {
      let url = gatewayAPI`/role_definitions/?order_by=name`;
      if (queryOptions.next) {
        url += `&order_by=${queryOptions.next}`;
      }
      if (queryOptions.search) {
        url += `&name__icontains=${queryOptions.search}`;
      }
      const itemsResponse = await requestGet<PlatformItemsResponse<PlatformRole>>(url);
      const remaining = itemsResponse.count - itemsResponse.results.length;
      const itemOptions = itemsResponse.results
        .filter((item) => {
          if (!contentType) {
            return true;
          }
          return item.content_type === contentType;
        })
        .map((item) => {
          return {
            label: item.name,
            value: item.name,
          };
        });
      const lastItem = itemsResponse.results[itemsResponse.results.length - 1];
      const next = lastItem?.name as number | string | undefined;
      const result: PageAsyncSelectQueryResult<string> = {
        remaining,
        options: itemOptions,
        next: next ?? '',
      };
      return result;
    },
    [contentType]
  );
}
