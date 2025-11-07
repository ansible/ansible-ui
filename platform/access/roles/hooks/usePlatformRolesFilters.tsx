import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function usePlatformRolesFilters(
  resourceTypeNames?: { name: string; value: string; service: string }[]
) {
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  return useMemo<IToolbarFilter[]>(() => {
    const filters: IToolbarFilter[] = [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__icontains',
        comparison: 'contains',
      },
      {
        key: 'component',
        label: t('Component'),
        placeholder: t('Select component'),
        type: ToolbarFilterType.MultiSelect,
        query: 'permissions__content_type__service',
        options: [
          { value: 'awx', label: t('Automation Execution') },
          { value: 'eda', label: t('Automation Decisions') },
          { value: 'galaxy', label: t('Automation Content') },
          { value: 'shared', label: t('Multiple Components') },
        ],
      },
    ];

    if (Array.isArray(resourceTypeNames) && resourceTypeNames.length > 0) {
      const options = resourceTypeNames
        .map((resourceType) => ({
          key: resourceType.value,
          value: resourceType.value,
          label: getDisplayName(resourceType.name, { isTitleCase: true }),
          group: getDisplayName(resourceType.service, { isTitleCase: true }),
        }))
        .sort((a, b) => {
          const groupCompare = a.group.localeCompare(b.group);
          if (groupCompare !== 0) return groupCompare;
          return a.label.localeCompare(b.label);
        });

      filters.push({
        key: 'resource_type',
        label: t('Resource Type'),
        placeholder: t('Select resource type'),
        type: ToolbarFilterType.MultiSelect,
        query: 'content_type__api_slug',
        options,
      });
    }

    return filters;
  }, [t, resourceTypeNames, getDisplayName]);
}
