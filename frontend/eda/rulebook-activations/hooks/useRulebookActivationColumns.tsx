import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { EdaRoute } from '../../EdaRoutes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { Status0E7Enum } from '../../interfaces/generated/eda-api';
import { Label } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

export function useRulebookActivationColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebookActivation) =>
          rulebookActivation?.status !== Status0E7Enum.Deleting ? (
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
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Activation status'),
        cell: (activation) =>
          activation?.status === Status0E7Enum.Deleting ? (
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
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Fire count'),
        type: 'count',
        value: (activation) => activation?.rules_fired_count ?? 0,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Restart count'),
        type: 'count',
        value: (activation) => activation?.restart_count ?? 0,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (activation) => activation.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (activation) => activation.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Activation ID'),
        type: 'text',
        value: (activation) => activation.id.toString(),
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
}
