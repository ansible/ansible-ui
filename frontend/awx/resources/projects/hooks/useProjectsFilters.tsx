import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useProjectsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        query: 'scm_type',
        options: [
          { label: t('Manual'), value: '' },
          { label: t('Git'), value: 'git' },
          { label: t('Subversion'), value: 'svn' },
          { label: t('Remote archive'), value: 'archive' },
          { label: t('Red Hat insights'), value: 'insights' },
        ],
        placeholder: t('Select types'),
      },
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      t,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ]
  );
  return toolbarFilters;
}
