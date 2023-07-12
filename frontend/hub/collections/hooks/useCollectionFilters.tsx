import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';

export function useCollectionFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: 'string',
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: 'string',
        query: 'namespace',
        comparison: 'equals',
      },
      {
        key: 'is_signed',
        label: t('Signature'),
        type: 'select',
        query: 'is_signed',
        options: [
          { label: t('Signed'), value: 'true' },
          { label: t('Unsigned'), value: 'false' },
        ],
        placeholder: t('Select signatures'),
      },
      {
        key: 'tags',
        label: t('Tags'),
        type: 'select',
        query: 'tags',
        options: [
          { label: t('application'), value: 'application' },
          { label: t('cloud'), value: 'cloud' },
          { label: t('database'), value: 'database' },
          { label: t('infrastructure'), value: 'infrastructure' },
          { label: t('linux'), value: 'linux' },
          { label: t('monitoring'), value: 'monitoring' },
          { label: t('networking'), value: 'networking' },
          { label: t('security'), value: 'security' },
          { label: t('storage'), value: 'storage' },
          { label: t('tools'), value: 'tools' },
          { label: t('windows'), value: 'windows' },
        ],
      },
    ],
    [t]
  );
}
