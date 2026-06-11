import { ITableColumn, IToolbarFilter, QueryParams } from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { usePlatformView } from '../hooks/usePlatformView';

/**
 * Hook for defining the view for a multi-select list in the context of a wizard. The selections made in the list
 * are maintained if the user returns to the step containing the list.
 * @param viewOptions Options for the view that defines the state of the table (URL, filters, columns etc.)
 * @param fieldName Specific field in the wizard that represents the selected items from the list
 * @returns The view that can be used to pass to the PageMultiSelectList component within a wizard
 */
export function usePlatformMultiSelectListView<T extends { id: number }>(
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
  const { wizardData, stepData, activeStep } = usePageWizard();
  const defaultSelection = () => {
    if (!Object.keys(wizardData).length && !Object.keys(stepData).length) return;
    if (`${fieldName}` in wizardData) {
      return (wizardData as { [key: string]: [] })[fieldName];
    }
    if (stepData[fieldName] !== undefined) {
      return stepData[fieldName];
    }
    if (
      activeStep !== null &&
      'idOfparentStep' in activeStep &&
      activeStep.idOfparentStep !== undefined
    ) {
      return (stepData as { [key: string]: { [key: string]: [] } })[`${activeStep.idOfparentStep}`][
        fieldName
      ];
    }
    return [];
  };
  const view = usePlatformView<T>({
    ...viewOptions,
    defaultSelection: (defaultSelection() as T[]) || [],
  });

  useEffect(() => {
    setValue(fieldName, view.selectedItems);
  }, [setValue, fieldName, view.selectedItems]);

  return view;
}
