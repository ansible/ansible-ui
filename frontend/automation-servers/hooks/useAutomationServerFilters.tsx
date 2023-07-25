import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../framework';
import { useAutomationServerTypes } from './useAutomationServerTypes';

export function useAutomationServerFilters() {
  const { t } = useTranslation();
  const automationServerTypes = useAutomationServerTypes();
  const options = useMemo(
    () =>
      Object.values(automationServerTypes).map((automationServerType) => ({
        label: automationServerType.name,
        value: automationServerType.type,
      })),
    [automationServerTypes]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'type',
        type: ToolbarFilterType.MultiSelect,
        query: 'type',
        label: t('Server Type'),
        placeholder: t('Filter by server type'),
        options: options,
      },
      // {
      //   key: 'labels',
      //   type: ToolbarFilterType.Text,
      //   query: 'labels',
      //   label: t('Label'),
      //   comparison: 'contains',
      // },
    ],
    [options, t]
  );
  return toolbarFilters;
}
