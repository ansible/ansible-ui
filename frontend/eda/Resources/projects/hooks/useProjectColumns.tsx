import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
} from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { StatusCell } from '../../../../common/Status';
import { EdaProject } from '../../../interfaces/EdaProject';

export function useProjectColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaProject>[]>(
    () => [
      {
        header: t('Name'),
        cell: (project) => (
          <TextCell
            text={project.name}
            to={RouteObj.EdaProjectDetails.replace(':id', project.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (instance) => instance.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Status'),
        cell: (project) => <StatusCell status={project.import_state} />,
      },
      {
        header: t('Git hash'),
        cell: (project) => <CopyCell text={project?.git_hash ? project.git_hash : ''} />,
        list: 'secondary',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],

    [t]
  );
}
