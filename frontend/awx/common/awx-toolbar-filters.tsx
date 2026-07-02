import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useQueryPlatformOptions } from '@ansible/platform-ui/common/useQueryPlatformOptions';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../interfaces/Label';
import { awxAPI } from './api/awx-utils';

export function useNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('Name'),
      type: ToolbarFilterType.MultiText,
      query: 'name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useInitiatedByToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'initiated-by',
      label: t('Initiated by (username)'),
      type: ToolbarFilterType.SingleText,
      query: 'actor__username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useDescriptionToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'description',
      label: t('Description'),
      type: ToolbarFilterType.MultiText,
      query: 'description__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useOrganizationToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'organization',
      label: t('Organization'),
      type: ToolbarFilterType.MultiText,
      query: 'organization__name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useCreatedByToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'created-by',
      label: t('Created by'),
      type: ToolbarFilterType.MultiText,
      query: 'created_by__username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useLaunchedByToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'launched-by',
      label: t('Launched by (username)'),
      type: ToolbarFilterType.MultiText,
      query: 'created_by__username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useModifiedByToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'modified-by',
      label: t('Modified by'),
      type: ToolbarFilterType.MultiText,
      query: 'modified_by__username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useUsernameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'username',
      label: t('Username'),
      type: ToolbarFilterType.MultiText,
      query: 'username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useFirstNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'firstname',
      label: t('First name'),
      type: ToolbarFilterType.MultiText,
      query: 'first_name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useLastNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'lastname',
      label: t('Last name'),
      type: ToolbarFilterType.MultiText,
      query: 'last_name__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useEmailToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'email',
      label: t('Email'),
      type: ToolbarFilterType.MultiText,
      query: 'email__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useInventoryTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'inventory-type',
      label: t('Inventory type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'kind',
      options: [
        { label: t('Inventory'), value: '' },
        { label: t('Smart inventory'), value: 'smart' },
        { label: t('Constructed inventory'), value: 'constructed' },
      ],
      placeholder: t('Select types'),
      disableSortOptions: true,
    }),
    [t]
  );
}

export function useGroupTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'group',
      label: t('Group type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'parents__isnull',
      options: [{ label: t('Show only root groups'), value: 'true' }],
      placeholder: t('Filter by group type'),
    }),
    [t]
  );
}

export function useImageToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'image',
      label: t('Image'),
      type: ToolbarFilterType.MultiText,
      query: 'image__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useHostnameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'hostname',
      label: t('Host name'),
      type: ToolbarFilterType.SingleText,
      query: 'hostname__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useAddressToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'address',
      label: t('Instance name'),
      type: ToolbarFilterType.SingleText,
      query: 'address__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useTemplateTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'type-templates',
      label: t('Type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'type',
      options: [
        { label: t('Job template'), value: 'job_template' },
        { label: t('Workflow job template'), value: 'workflow_job_template' },
      ],
      placeholder: t('Select types'),
    }),
    [t]
  );
}

export function useLabelsToolbarFilter() {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<Label, 'name', 'name'>({
    url: awxAPI`/labels/`,
    labelKey: 'name',
    valueKey: 'name',
    orderQuery: 'order_by',
  });
  const queryLabel = useCallback((label: string) => label, []);
  return useMemo<IToolbarFilter>(
    () => ({
      type: ToolbarFilterType.AsyncMultiSelect,
      key: 'labels',
      label: t('Labels'),
      query: 'labels__name',
      placeholder: t('Select labels'),
      queryOptions,
      queryLabel,
      useAndOperator: true,
    }),
    [queryLabel, queryOptions, t]
  );
}

export function useSearchToolbarFilter() {
  const { t } = useTranslation();
  return useMemo(() => {
    const filter: IToolbarFilter = {
      type: ToolbarFilterType.Search,
      key: 'search',
      label: t('Search'),
      query: 'search',
      placeholder: t('Enter search'),
    };
    return filter;
  }, [t]);
}

export function useHostFailedStatusFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'failed_status',
      label: t('Failed Status'),
      type: ToolbarFilterType.SingleSelect,
      query: 'last_job_host_summary__failed',
      options: [{ label: t('Show only failed hosts'), value: 'True' }],
      placeholder: t('Select'),
    }),
    [t]
  );
}
export function useHostReadyStatusFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'ready_status',
      label: t('Ready Status'),
      type: ToolbarFilterType.SingleSelect,
      query: 'not__last_job_host_summary__failed',
      options: [{ label: t('Show only ready hosts'), value: 'True' }],
      placeholder: t('Select'),
    }),
    [t]
  );
}

export function useLimitToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'limit',
      label: t('Limit'),
      type: ToolbarFilterType.SingleText,
      query: 'job__limit__icontains',
      placeholder: t('Enter limit'),
      comparison: 'contains',
    }),
    [t]
  );
}
