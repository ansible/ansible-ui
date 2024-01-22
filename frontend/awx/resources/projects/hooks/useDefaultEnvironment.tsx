import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useExecutionEnvironmentColumn() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column = useMemo<ITableColumn<Project>>(
    () => ({
      header: t('Default environment'),
      value: (project) => project.summary_fields?.default_environment?.name,
      cell: (project) => (
        <TextCell
          text={project.summary_fields?.default_environment?.name}
          to={getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: project.summary_fields?.default_environment?.id },
          })}
        />
      ),
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.hidden,
      dashboard: ColumnModalOption.hidden,
    }),
    [getPageUrl, t]
  );
  return column;
}
