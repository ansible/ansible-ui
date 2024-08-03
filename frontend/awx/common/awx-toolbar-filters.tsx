import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../framework';

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

export function useKeywordToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'keyword',
      label: t('Keyword'),
      type: ToolbarFilterType.SingleText,
      query: 'search',
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
      label: t('Created'),
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
