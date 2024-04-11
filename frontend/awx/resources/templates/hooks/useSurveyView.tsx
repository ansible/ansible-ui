import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ISelected, IView, useView, useSelected } from '../../../../../framework';
import { swrOptions, useFetcher } from '../../../../common/crud/Data';
import { RequestError } from '../../../../common/crud/RequestError';
import type { Spec } from '../../../interfaces/Survey';

export type ISurveyView = IView &
  ISelected<Spec> & {
    itemCount: number | undefined;
    pageItems: Spec[] | undefined;
    refresh: () => Promise<void>;
    selectItemsAndRefresh: (items: Spec[]) => void;
    unselectItemsAndRefresh: (items: Spec[]) => void;
    updateItem: (item: Spec) => void;
  };

interface SurveySpecResponse {
  name?: string;
  description?: string;
  spec?: Spec[];
}

export function useSurveyView(options: { url: string }): ISurveyView {
  const { url } = options;

  const view = useView({ disableQueryString: true });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const fetcher = useFetcher();
  const response = useSWR<SurveySpecResponse>(url, fetcher, swrOptions);
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate().finally(() => {});
  }, [mutate]);
  useSWR<SurveySpecResponse>(url, fetcher, swrOptions);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof RequestError) {
    if (error.statusCode === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  function getSpecKey(item: { variable: string }) {
    return item?.variable;
  }

  const selection = useSelected<Spec>(data?.spec ?? [], getSpecKey);

  if (data && data.spec !== undefined) {
    itemCountRef.current.itemCount = data.spec.length;
  } else if (data && data.spec === undefined) {
    itemCountRef.current.itemCount = 0;
  }

  const selectItemsAndRefresh = useCallback(
    (items: Spec[]) => {
      selection.selectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

  const unselectItemsAndRefresh = useCallback(
    (items: Spec[]) => {
      selection.unselectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

  const [items, setItems] = useState<Spec[] | undefined>(undefined);
  useEffect(() => {
    setItems(data?.spec);
  }, [data?.spec]);

  const updateItem = useCallback(
    (item: Spec) => {
      if (!items) return;
      const index = items?.findIndex((i) => i.variable === item.variable);
      if (index !== -1) {
        const newItems = [...items];
        newItems[index] = item;
        setItems(newItems);
      }
    },
    [items]
  );

  return useMemo(() => {
    return {
      error,
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: items,
      ...view,
      ...selection,
      selectItemsAndRefresh,
      unselectItemsAndRefresh,
      updateItem,
    };
  }, [
    error,
    items,
    refresh,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    updateItem,
    view,
  ]);
}
