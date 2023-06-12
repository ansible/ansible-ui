import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, CopyCell, ITableColumn } from '../../../../../framework';
import { ScmType } from '../../../../common/scm';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { useProjectStatusColumn } from './useProjectStatusColumn';
import { useLastUsedColumn } from './useLastUsedColumn';
import { useExecutionEnvironmentColumn } from './useDefaultEnvironment';
import { Project } from '../../../interfaces/Project';
import { useProjectNameColumn } from './useProjectNameColumn';

export function useProjectsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const nameColumn = useProjectNameColumn({ disableLinks: options?.disableLinks });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const statusColumn = useProjectStatusColumn({
    ...options,
    tooltip: t`Click to view latest project sync job`,
    tooltipAlt: t`Unable to load latest project sync job`,
  });
  const lastUsedColumn = useLastUsedColumn();
  const defaultEnvironmentColumn = useExecutionEnvironmentColumn();
  const tableColumns = useMemo<ITableColumn<Project>[]>(
    () => [
      nameColumn,
      descriptionColumn,
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
      lastUsedColumn,
      defaultEnvironmentColumn,
    ],
    [
      createdColumn,
      defaultEnvironmentColumn,
      descriptionColumn,
      lastUsedColumn,
      modifiedColumn,
      nameColumn,
      organizationColumn,
      statusColumn,
      t,
    ]
  );
  return tableColumns;
}
