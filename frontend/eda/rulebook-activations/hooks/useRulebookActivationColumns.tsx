import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { SwitchCell } from '../../common/SwitchCell';
import { StatusLabelCell } from '../../common/StatusLabelCell';

export function useRulebookActivationColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebookActivation) => (
          <TextCell
            text={rulebookActivation.name}
            onClick={() =>
              navigate(
                RouteObj.EdaRulebookActivationDetails.replace(
                  ':id',
                  rulebookActivation.id.toString()
                )
              )
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Activation status'),
        cell: (activation) => <StatusLabelCell status={activation?.status} />,
        sort: 'status',
        defaultSort: true,
      },
      {
        header: t('Number of rules'),
        cell: (activation) => (
          <TextCell text={`${activation?.rules_count ? activation.rules_count : 0}`} />
        ),
        sort: 'rules_count',
      },
      {
        header: t('Fire count'),
        cell: (activation) => (
          <TextCell text={`${activation?.fired_count ? activation.fired_count : 0}`} />
        ),
        sort: 'fired_count',
      },
      {
        header: t('Activation instances'),
        cell: (activation) => (
          <TextCell text={`${activation?.instances_count ? activation.instances_count : 0}`} />
        ),
        sort: 'instance_count',
      },
      {
        header: '',
        style: 'maxWidth: 0',

        cell: (activation) => <SwitchCell state={activation.is_enabled || false} />,
      },
    ],
    [navigate, t]
  );
}
