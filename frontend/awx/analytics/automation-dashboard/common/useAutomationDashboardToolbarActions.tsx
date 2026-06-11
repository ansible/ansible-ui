import {
  IFilterState,
  IPageAction,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { IDashboardFilterSet, IJobTemplate } from '../types';
import { useCreateToolbarFilterSet } from './useCreateToolbarFilterSet';
import { useRemoveToolbarFilterSet } from './useRemoveToolbarFilterSet';
import { useUpdateToolbarFilterSet } from './useUpdateToolbarFilterSet';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

/** Returns true when filterState is empty or equals the default (period = last 7 days only). */
function isDefaultFilterState(filterState: IFilterState | undefined): boolean {
  if (!filterState) return true;
  const activeEntries = Object.entries(filterState).filter(([, v]) => v && v.length > 0);
  if (activeEntries.length === 0) return true;
  return (
    activeEntries.length === 1 &&
    activeEntries[0][0] === 'period' &&
    activeEntries[0][1]?.length === 1 &&
    (activeEntries[0][1][0] as AutomationDashboardDateRangeFilterPresets) ===
      AutomationDashboardDateRangeFilterPresets.last_7_days
  );
}

export function useAutomationDashboardToolbarActions(props: {
  filterState?: IFilterState;
  selectedFilterSet?: IDashboardFilterSet;
  onDelete: (deletedFilterSet: IDashboardFilterSet) => void;
  onSave: (filterSet: IDashboardFilterSet) => void;
}) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const { filterState, selectedFilterSet, onDelete, onSave } = props;
  const createToolbarFilterSet = useCreateToolbarFilterSet(onSave);
  const updateToolbarFilterSet = useUpdateToolbarFilterSet(onSave);
  const removeToolbarFilterSet = useRemoveToolbarFilterSet((deleted) => {
    if (deleted.length > 0) onDelete(deleted[0]);
  });

  const superuserDisabledReason = activeAwxUser?.is_superuser
    ? undefined
    : t('Only administrators can save reports');

  const superuserDeleteDisabledReason = activeAwxUser?.is_superuser
    ? undefined
    : t('Only administrators can delete reports');

  const saveDisabledReason =
    superuserDisabledReason ??
    (isDefaultFilterState(filterState) ? t('Modify filters before saving as a report') : undefined);

  return useMemo<IPageAction<IJobTemplate>[]>(
    () =>
      selectedFilterSet
        ? [
            {
              type: PageActionType.Dropdown,
              icon: PlusCircleIcon,
              variant: ButtonVariant.primary,
              isPinned: true,
              selection: PageActionSelection.None,
              label: t('Save as report'),
              actions: [
                {
                  type: PageActionType.Button,
                  icon: PlusCircleIcon,
                  selection: PageActionSelection.None,
                  label: t('Create new report'),
                  isDisabled: saveDisabledReason,
                  onClick: () => (filterState ? createToolbarFilterSet(filterState) : {}),
                },
                {
                  type: PageActionType.Button,
                  icon: PencilAltIcon,
                  selection: PageActionSelection.None,
                  label: t('Edit current report'),
                  isDisabled: saveDisabledReason,
                  onClick: () =>
                    filterState && selectedFilterSet
                      ? updateToolbarFilterSet(selectedFilterSet, filterState)
                      : {},
                },
                {
                  type: PageActionType.Button,
                  selection: PageActionSelection.None,
                  label: t('Delete current report'),
                  onClick: () => removeToolbarFilterSet(selectedFilterSet),
                  icon: TrashIcon,
                  isDisabled: superuserDeleteDisabledReason,
                  variant: ButtonVariant.danger,
                },
              ],
            },
          ]
        : [
            {
              type: PageActionType.Button,
              icon: PlusCircleIcon,
              variant: ButtonVariant.primary,
              isPinned: true,
              selection: PageActionSelection.None,
              label: t('Save as report'),
              isDisabled: saveDisabledReason,
              onClick: () => (filterState ? createToolbarFilterSet(filterState) : {}),
            },
          ],
    [
      selectedFilterSet,
      t,
      saveDisabledReason,
      superuserDeleteDisabledReason,
      filterState,
      createToolbarFilterSet,
      updateToolbarFilterSet,
      removeToolbarFilterSet,
    ]
  );
}
