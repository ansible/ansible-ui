import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import {
  PageAsyncSelectOptionsFn,
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback } from 'react';
import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const PAGE_SIZE = 20;

export function PageFormPlatformRoleNameSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: {
  name: TFieldName;
  contentType?: string | null;
  isRequired?: boolean;
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();
  const queryOptions = useQueryRoleOptions(props.contentType);

  const writeInOption = useCallback(
    (searchString: string) =>
      ({
        label: searchString,
        value: searchString,
      }) as PageSelectOption<PathValue<TFieldValues, TFieldName>>,
    []
  );

  return (
    <PageFormAsyncSingleSelect<TFieldValues, TFieldName>
      name={props.name}
      id="role"
      label={t('Role')}
      placeholder={t('Select role')}
      labelHelp={t('Specify the role that matching users are added to or barred from. ')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading role...')}
      queryErrorText={t('Error loading roles')}
      queryLabel={(name: string) => name}
      isRequired={props.isRequired}
      onChange={props.onChange}
      writeInOption={writeInOption}
    />
  );
}

function useQueryRoleOptions(contentType?: string | null): PageAsyncSelectOptionsFn<string> {
  return useCallback(
    async (queryOptions: PageAsyncSelectQueryOptions) => {
      let url = gatewayAPI`/role_definitions/?order_by=name&page_size=${PAGE_SIZE}`;
      const currentPage = (queryOptions.next as number) || 1;
      url += `&page=${currentPage}`;
      if (queryOptions.search) {
        url += `&name__icontains=${encodeURIComponent(queryOptions.search)}`;
      }
      if (contentType) {
        url += `&content_type__api_slug=${encodeURIComponent(contentType)}`;
      }
      const itemsResponse = await requestGet<PlatformItemsResponse<PlatformRole>>(url);
      const itemOptions = itemsResponse.results.map((item) => {
        return {
          label: item.name,
          value: item.name,
        };
      });

      // Calculate remaining items based on actual API response
      const totalItems = itemsResponse.count;
      const currentItemCount = itemsResponse.results.length;
      const itemsReturnedSoFar = (currentPage - 1) * PAGE_SIZE + currentItemCount;
      const remaining = Math.max(0, totalItems - itemsReturnedSoFar);

      const result: PageAsyncSelectQueryResult<string> = {
        remaining,
        options: itemOptions,
        next: currentPage + 1,
      };
      return result;
    },
    [contentType]
  );
}
