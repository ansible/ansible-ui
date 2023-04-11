import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../framework';

export function useNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('Name'),
      type: 'string',
      query: 'name__icontains',
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
      type: 'string',
      query: 'description__icontains',
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
      type: 'string',
      query: 'organization__name__icontains',
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
      type: 'string',
      query: 'created_by__username__icontains',
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
      type: 'string',
      query: 'modified_by__username__icontains',
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
      type: 'string',
      query: 'username__icontains',
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
      type: 'string',
      query: 'first_name__icontains',
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
      type: 'string',
      query: 'last_name__icontains',
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
      type: 'string',
      query: 'email__icontains',
    }),
    [t]
  );
}

export function useInventoryTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'kind',
      label: t('Inventory Type'),
      type: 'select',
      query: 'or__kind',
      options: [
        { label: t('Inventory'), value: '' },
        { label: t('Smart Inventory'), value: 'smart' },
        { label: t('Constructed Inventory'), value: 'constructed' },
      ],
      placeholder: t('Select inventory types'),
    }),
    [t]
  );
}
