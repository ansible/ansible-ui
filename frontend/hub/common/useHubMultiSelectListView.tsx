import { useFormContext } from 'react-hook-form';
import { ITableColumn, IToolbarFilter } from '../../../framework';
import { QueryParams } from './api/hub-api-utils';
import { usePageWizard } from '../../../framework/PageWizard/PageWizardProvider';
import { useHubView } from './useHubView';
import { useEffect } from 'react';

/**
 * Hook for defining the view for a multi-select list in the context of a wizard. The selections made in the list
 * are maintained if the user returns to the step containing the list.
 * @param viewOptions Options for the view that defines the state of the table (URL, filters, columns etc.)
 * @param fieldName Specific field in the wizard that represents the selected items from the list
 * @returns The view that can be used to pass to the PageMultiSelectList component within a wizard
 */
type ResourceTypeWithID = { id: number | string };
type ResourceTypeWithPulpHref = { pulp_href: string };

export function useHubMultiSelectListView<T extends ResourceTypeWithID | ResourceTypeWithPulpHref>(
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
    keyFn?: (item: T) => string | number;
  },
  fieldName: string
) {
  const { setValue } = useFormContext();
  const { wizardData, stepData } = usePageWizard();

  const view = useHubView<T>({
    ...viewOptions,
    keyFn: (item) => {
      if ((item as ResourceTypeWithID).id) {
        return (item as ResourceTypeWithID).id;
      }
      return (item as ResourceTypeWithPulpHref).pulp_href;
    },
    defaultSelection: ((wizardData as { [key: string]: [] })[fieldName] ||
      stepData[fieldName] ||
      []) as T[],
  });

  useEffect(() => {
    setValue(fieldName, view.selectedItems);
  }, [setValue, fieldName, view.selectedItems]);

  return view;
}
