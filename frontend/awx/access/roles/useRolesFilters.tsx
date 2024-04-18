import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useDynamicToolbarFilters } from '../../common/useDynamicFilters';
import { useMemo } from 'react';

export function useRolesFilters() {
  const { t } = useTranslation();
  const roleToolbarFilter = useMemo<IToolbarFilter>(
    () => ({
      key: 'role',
      label: t('Role'),
      type: ToolbarFilterType.MultiText,
      query: 'role_field__icontains',
      comparison: 'contains',
    }),
    [t]
  );
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'roles',
    preFilledValueKeys: {
      id: {
        apiPath: 'roles',
      },
    },
    additionalFilters: [roleToolbarFilter],
    preSortedKeys: ['role', 'id'],
  });
  return toolbarFilters;
}
