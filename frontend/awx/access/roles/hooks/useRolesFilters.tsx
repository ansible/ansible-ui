import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useRolesFilters() {
  const { t } = useTranslation();
  const searchFilter = useSearchToolbarFilter();
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
    additionalFilters: [searchFilter, roleToolbarFilter],
    preSortedKeys: ['search', 'role', 'id'],
  });
  return toolbarFilters;
}
