import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../framework';

export function useNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('Name'),
      type: ToolbarFilterType.Text,
      query: 'name__icontains',
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      type: ToolbarFilterType.Text,
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
      key: 'kind',
      label: t('Inventory type'),
      type: ToolbarFilterType.MultiSelect,
      query: 'or__kind',
      options: [
        { label: t('Inventory'), value: '' },
        { label: t('Smart inventory'), value: 'smart' },
        { label: t('Constructed inventory'), value: 'constructed' },
      ],
      placeholder: t('Select types'),
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
