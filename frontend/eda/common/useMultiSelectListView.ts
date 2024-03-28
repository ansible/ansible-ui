import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { IToolbarFilter, ITableColumn } from '../../../framework';
import { usePageWizard } from '../../../framework/PageWizard/PageWizardProvider';
import { useEdaView, QueryParams } from './useEventDrivenView';

export function useMultiSelectListView<T extends { id: string | number }>(
  viewOptions: {
    url: string;
    viewPage?: number;
    viewPerPage?: number;
    toolbarFilters?: IToolbarFilter[];
    tableColumns?: ITableColumn<T>[];
    queryParams?: QueryParams;
    disableQueryString?: boolean;
    defaultSort?: string | undefined;
    defaultSortDirection?: 'asc' | 'desc' | undefined;
  },
  fieldName: string
) {
  const { setValue } = useFormContext();
  const { wizardData } = usePageWizard();

  const view = useEdaView<T>({
    ...viewOptions,
    defaultSelection: ((wizardData as { [key: string]: [] })[fieldName] || []) as T[],
  });

  useEffect(() => {
    setValue(fieldName, view.selectedItems);
  }, [setValue, fieldName, view.selectedItems]);

  return view;
}
