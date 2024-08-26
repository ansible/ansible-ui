import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { Label } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { StatusCell } from '../../../common/Status';

export function useEventStreamActivationsColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('Name'),
        cell: (activation) => (
          <TextCell
            text={activation.name}
            to={getPageUrl(EdaRoute.RulebookActivationPage, {
              params: { id: activation.id },
            })}
          />
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
        header: t('Created'),
        type: 'datetime',
        value: (activation) => activation.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (activation) => activation.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
