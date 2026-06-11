import {
  ColumnTableOption,
  ITableColumn,
  PFColorE,
  TextCell,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';

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
            <TextCell
              text={t('Pending delete')}
              color={PFColorE.Danger}
              icon={<InfoCircleIcon />}
            />
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
