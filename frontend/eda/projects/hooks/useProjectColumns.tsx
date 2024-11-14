import {
  ColumnModalOption,
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';

export function useProjectColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaProject>[]>(
    () => [
      {
        header: t('Name'),
        cell: (project) => (
          <TextCell
            text={project.name}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(EdaRoute.ProjectPage, { params: { id: project.id } })
            }
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (instance) => instance.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
      {
        header: t('Status'),
        cell: (project) => <StatusCell status={project.import_state} />,
      },
      {
        header: t('Git hash'),
        cell: (project) => <CopyCell text={project?.git_hash ? project.git_hash : ''} />,
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
    ],
    [getPageUrl, options?.disableLinks, t]
  );
}
