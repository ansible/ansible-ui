import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaProject } from '../../../interfaces/EdaProject';
import { StatusLabelCell } from '../../../common/StatusLabelCell';

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
        header: t('Status'),
        cell: (project) => <StatusLabelCell status={project.import_state} />,
      },
      {
        header: t('Revision'),
        cell: (project) => <TextCell text={project?.git_hash ? project.git_hash : ''} />,
      },
    ],

    [navigate, t]
  );
}
