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
      {
        key: 'repository_name',
        label: t('Repository'),
        type: 'select',
        query: 'repository_name',
        options: repoList.map((repo: Repository) => {
          return { label: repo.name, value: repo.name };
        }),
        placeholder: t('Select repositories'),
        hasSearch: true,
      },
    ],
    [t, repoList]
  );
}

interface Repository {
  name: string;
}
