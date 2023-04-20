import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, TextCell, ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';

export function useExecutionEnvironmentColumn() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<Project>>(
    () => ({
      header: t('Default Environment'),
      value: (project) => project.summary_fields?.default_environment?.name,
      cell: (project) => (
        <TextCell
          text={project.summary_fields?.default_environment?.name}
          to={RouteObj.ExecutionEnvironmentDetails.replace(
            ':id',
            (project.summary_fields?.default_environment?.id ?? '').toString()
          )}
        />
      ),
      table: ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
    }),
    [t]
  );
  return column;
}
