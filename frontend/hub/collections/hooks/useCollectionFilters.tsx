import { SelectVariant } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../api';

export function useCollectionFilters() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);

  const { data, isLoading } = useGet<{ results: Repository[] }>(
    pulpAPI`/repositories/ansible/ansible/?limit=10&name__startswith=${searchText}`
  );

  useEffect(() => {
    if (!isLoading) {
      setRepositories(data?.results || []);
    }
  }, [data?.results, isLoading]);

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.Text,
        query: 'namespace',
        comparison: 'equals',
      },
      {
        key: 'repository',
        label: t('Repository'),
        type: ToolbarFilterType.SingleSelect,
        query: 'repository',
        variant: SelectVariant.single,
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
        type: ToolbarFilterType.Text,
        query: 'tags',
        comparison: 'equals',
      },
      {
        key: 'type',
        label: t('Type'),
        type: ToolbarFilterType.MultiSelect,
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
        type: ToolbarFilterType.MultiSelect,
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
