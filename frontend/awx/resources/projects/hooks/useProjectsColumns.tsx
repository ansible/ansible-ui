import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnModalOption, CopyCell, ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import {
  useCreatedColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { ScmType } from '../../../../common/scm';
import { Project } from '../../../interfaces/Project';
import { useProjectStatusColumn } from './useProjectStatusColumn';

export function useProjectsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (project: Project) => navigate(RouteObj.ProjectDetails.replace(':id', project.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const organizationColumn = useOrganizationNameColumn(options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const statusColumn = useProjectStatusColumn({
    ...options,
    tooltip: t`Click to view latest project sync job`,
    tooltipAlt: t`Unable to load latest project sync job`,
  });
  const tableColumns = useMemo<ITableColumn<Project>[]>(
    () => [
      nameColumn,
      statusColumn,
      {
        header: t('Type'),
        cell: (project) => <ScmType scmType={project.scm_type} />,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Revision'),
        cell: (project) =>
          project.scm_revision ? <CopyCell text={project.scm_revision} /> : t('Sync for revision'),
        modal: ColumnModalOption.Hidden,
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, t, organizationColumn, createdColumn, modifiedColumn, statusColumn]
  );
  return tableColumns;
}
