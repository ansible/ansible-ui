import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ScmType } from '../../../../common/scm';
import { CopyCell, ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
  useStatusColumn,
} from '../../../../common/columns';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';

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
  const statusColumn = useStatusColumn({
    ...options,
    tooltip: t`Click to view latest project sync job`,
  });
  const tableColumns = useMemo<ITableColumn<Project>[]>(
    () => [
      nameColumn,
      statusColumn,
      {
        header: t('Type'),
        cell: (project) => <ScmType scmType={project.scm_type} />,
      },
      {
        header: t('Revision'),
        cell: (project) =>
          project.scm_revision ? <CopyCell text={project.scm_revision} /> : t('Sync for revision'),
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, t, organizationColumn, createdColumn, modifiedColumn, statusColumn]
  );
  return tableColumns;
}
