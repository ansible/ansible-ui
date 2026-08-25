import {
  IFilterState,
  IPageAction,
  IToolbarFilter,
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
import { hasValidRequiredFilters } from '../utils/queryString';

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

function getSaveDisabledReason(
  superuserDisabledReason: string | undefined,
  validFilters: boolean,
  filterState: IFilterState | undefined,
  t: (key: string) => string
): string | undefined {
  if (superuserDisabledReason) return superuserDisabledReason;
  if (!validFilters) return t('Enter a valid custom date range before saving');
  if (isDefaultFilterState(filterState)) return t('Modify filters before saving as a report');
  return undefined;
}

function getEditDisabledReason(
  superuserDisabledReason: string | undefined,
  validFilters: boolean,
  t: (key: string) => string
): string | undefined {
  if (superuserDisabledReason) return superuserDisabledReason;
  if (!validFilters) return t('Enter a valid custom date range before updating');
  return undefined;
}

export function useAutomationDashboardToolbarActions(props: {
  filterState?: IFilterState;
  toolbarFilters?: IToolbarFilter[];
  selectedFilterSet?: IDashboardFilterSet;
  onDelete: (deletedFilterSet: IDashboardFilterSet) => void;
  onSave: (filterSet: IDashboardFilterSet) => void;
}) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const { filterState, toolbarFilters, selectedFilterSet, onDelete, onSave } = props;
  const createToolbarFilterSet = useCreateToolbarFilterSet(onSave);
  const updateToolbarFilterSet = useUpdateToolbarFilterSet(onSave);
  const removeToolbarFilterSet = useRemoveToolbarFilterSet((deleted) => {
    if (deleted.length > 0) onDelete(deleted[0]);
  });
  const validFilters = hasValidRequiredFilters(toolbarFilters, filterState);

  const superuserDisabledReason = activeAwxUser?.is_superuser
    ? undefined
    : t('Only administrators can save reports');

  const superuserDeleteDisabledReason = activeAwxUser?.is_superuser
    ? undefined
    : t('Only administrators can delete reports');

  const saveDisabledReason = getSaveDisabledReason(
    superuserDisabledReason,
    validFilters,
    filterState,
    t
  );

  // Editing a report's name and/or persisting the current filter state to it is
  // valid regardless of the default/non-default filter state, but the current
  // filter state must still be valid to be persisted.
  const editDisabledReason = getEditDisabledReason(superuserDisabledReason, validFilters, t);

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
              label: t('Report actions'),
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
                  label: t('Update report'),
                  isDisabled: editDisabledReason,
                  onClick: () =>
                    filterState && selectedFilterSet
                      ? updateToolbarFilterSet(selectedFilterSet, filterState)
                      : {},
                },
                {
                  type: PageActionType.Button,
                  selection: PageActionSelection.None,
                  label: t('Delete report'),
                  onClick: () => removeToolbarFilterSet(selectedFilterSet),
                  icon: TrashIcon,
                  isDisabled: superuserDeleteDisabledReason,
                  isDanger: true,
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
              label: t('Create new report'),
              isDisabled: saveDisabledReason,
              onClick: () => (filterState ? createToolbarFilterSet(filterState) : {}),
            },
          ],
    [
      selectedFilterSet,
      t,
      saveDisabledReason,
      editDisabledReason,
      superuserDeleteDisabledReason,
      filterState,
      createToolbarFilterSet,
      updateToolbarFilterSet,
      removeToolbarFilterSet,
    ]
  );
}
