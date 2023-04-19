import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { ScmType } from '../../../../common/scm';
import { StatusLabelCell } from '../../../common/StatusLabelCell';
import { EdaProject } from '../../../interfaces/EdaProject';

export function useProjectColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaProject>[]>(
    () => [
      {
        header: t('Name'),
        cell: (project) => (
          <TextCell
            text={project.name}
            onClick={() =>
              navigate(RouteObj.EdaProjectDetails.replace(':id', project.id.toString()))
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
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
        cell: (project) => <StatusLabelCell status={project.import_state} />,
      },
      {
        header: t('Type'),
        cell: () => <ScmType scmType="git" />,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Url'),
        cell: (item) => <TextCell text={item.url} to={item.url} />,
        value: (instance) => instance.url,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Revision'),
        cell: (project) => <CopyCell text={project?.git_hash ? project.git_hash : ''} />,
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
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

    [navigate, t]
  );
}
