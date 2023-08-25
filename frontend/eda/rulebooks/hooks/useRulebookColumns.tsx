import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaProjectCell } from '../../Resources/projects/components/EdaProjectCell';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useRulebookColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaRulebook>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebook) => (
          <TextCell
            text={rulebook.name}
            to={RouteObj.EdaRulebookDetails.replace(':id', rulebook.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (rulebook) => rulebook.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Project'),
        cell: (rulebook) => <EdaProjectCell id={rulebook.project_id} />,
        value: (rulebook) => rulebook.project_id,
        // table: ColumnTableOption.Expanded,
      },
      // {
      //   header: t('Rules'),
      //   type: 'count',
      //   value: (rulebook) => rulebook?.rule_count ?? 0,
      // },
      // {
      //   header: t('Fire count'),
      //   type: 'count',
      //   value: (rulebook) => rulebook?.fire_count ?? 0,
      //   card: 'name',
      //   list: 'name',
      // },
      {
        header: t('Created'),
        type: 'datetime',
        value: (rulebook) => rulebook.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (rulebook) => rulebook.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
}
