import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api';

export function useCollectionFilters() {
  const { t } = useTranslation();
  //const [repositories, setRepositories] = useState([]);

  const repositories = usePulpView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: (item) => item.name,
    queryParams: {
      pulp_label_select: '!hide_from_search',
    },
  });

  const repoList: any = repositories.pageItems || [];

  return [
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
      key: 'repository_name',
      label: t('Repository'),
      type: 'select',
      query: 'repository_name',
      options: repoList.map((repo: Repository) => {
        return { label: repo.name, value: repo.name };
      }),
      placeholder: t('Select repositories'),
    },
  ];
}

/*
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
        key: 'repository',
        label: t('Repository'),
        type: 'select',
        query: 'repository',
        options: [
          { label: t('Published'), value: 'published' },
          { label: t('Red Hat certified'), value: 'rh-certified' },
          { label: t('Community'), value: 'community' },
          { label: t('Validated'), value: 'validated' },
        ],
        placeholder: t('Select repositories'),
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
    [t]
  );
}
*/

interface Repository {
  name: string;
}
