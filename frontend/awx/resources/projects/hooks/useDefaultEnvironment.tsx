import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { Project } from '../../../interfaces/Project';

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
      table: ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.Hidden,
    }),
    [getPageUrl, t]
  );
  return column;
}
