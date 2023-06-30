import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api';

export function useCollectionFilters() {
  const { t } = useTranslation();

  const repositories = usePulpView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: (item) => item.name,
    queryParams: {
      pulp_label_select: '!hide_from_search',
    },
  });

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
        key: 'repository',
        label: t('Repository'),
        type: 'select',
        query: 'repository',
        options: repositories.pageItems
          ? repositories.pageItems.map((repo) => {
              return { label: repo.name, value: repo.name };
            })
          : [],
        placeholder: t('Select repositories'),
        hasSearch: true,
      },
      {
        key: 'tags',
        label: t('Tags'),
        type: 'string',
        query: 'tags',
        comparison: 'equals',
      },
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        query: 'type',
        options: [
          { label: t('Synced'), value: 'synced' },
          { label: t('Unsynced'), value: 'unsynced' },
        ],
        placeholder: t('Select types'),
      },
      {
        key: 'signature',
        label: t('Signature'),
        type: 'select',
        query: 'sign_state',
        options: [
          { label: t('Signed'), value: 'signed' },
          { label: t('Unsigned'), value: 'unsigned' },
        ],
        placeholder: t('Select signatures'),
      },
    ],
    [t, repositories.pageItems]
  );
}

interface Repository {
  name: string;
}
