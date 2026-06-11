import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useRuleAuditFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: `name__icontains`,
        comparison: 'contains',
      },
      {
        key: 'activation-instance',
        label: t('Activation'),
        type: ToolbarFilterType.SingleText,
        query: 'activation_instance__name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
