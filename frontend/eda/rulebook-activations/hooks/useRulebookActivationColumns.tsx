import { Label, Truncate } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';

export function useRulebookActivationColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('ID'),
        type: 'text',
        value: (activation) => activation.id.toString(),
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Name'),
        cell: (rulebookActivation) =>
          rulebookActivation?.status !== StatusEnum.Deleting ? (
            <TextCell
              text={rulebookActivation.name}
              to={getPageUrl(EdaRoute.RulebookActivationPage, {
                params: { id: rulebookActivation.id },
              })}
            />
          ) : (
            <TextCell text={rulebookActivation.name} />
          ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (activation) => activation.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Status'),
        cell: (activation) =>
          activation?.status === StatusEnum.Deleting ? (
            <Label color="red" icon={<InfoCircleIcon />}>
              {t('Pending delete')}
            </Label>
          ) : (
            <StatusCell status={activation?.status} />
          ),
      },
      {
        header: t('Number of rules'),
        type: 'count',
        value: (activation) => activation?.rules_count ?? 0,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Fire count'),
        type: 'count',
        value: (activation) => activation?.rules_fired_count ?? 0,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Restart count'),
        type: 'count',
        value: (activation) => activation?.restart_count ?? 0,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Status message'),
        cell: (activation) => <Truncate content={activation?.status_message || ''} />,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (activation) => activation.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (activation) => activation.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
    ],
    [getPageUrl, t]
  );
}
