import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';
import { pulpAPI } from '../../api';
import { useGetRequest } from '../../../common/crud/useGetRequest';

export function useCollectionFilters() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);

  const request = useCallback(useGetRequest<{ results: Repository[] }>(), []);

  useEffect(() => {
    request(pulpAPI`/repositories/ansible/ansible/?limit=10&name__startswith=${searchText}`)
      .then((data) => {
        setRepositories(data?.results || []);
      })
      .catch((ex) => {
        // TODO - how to handle errors here?
      });
  }, [searchText, request]);

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
        options:
          repositories?.map((repo: Repository) => {
            return { value: repo.name, label: repo.name };
          }) || [],
        placeholder: t('Select repositories'),
        hasSearch: true,
        onSearchTextChange: (text) => {
          setSearchText(text);
        },
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
    [t, repositories]
  );
}

interface Repository {
  name: string;
}
