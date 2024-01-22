import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, CopyCell, ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { ScmType } from '../../../../common/scm';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useExecutionEnvironmentColumn } from './useDefaultEnvironment';
import { useLastUsedColumn } from './useLastUsedColumn';
import { useProjectNameColumn } from './useProjectNameColumn';
import { useProjectStatusColumn } from './useProjectStatusColumn';

export function useProjectsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const nameColumn = useProjectNameColumn({ disableLinks: options?.disableLinks });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
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
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
      {
        header: t('Revision'),
        cell: (project) =>
          project.scm_revision ? <CopyCell text={project.scm_revision} /> : t('Sync for revision'),
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
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
