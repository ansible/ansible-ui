import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useRulebookColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaRulebook>[]>(
    () => [
      {
        header: t('Name'),
        cell: (rulebook) => (
          <TextCell
            text={rulebook.name}
            onClick={() =>
              navigate(RouteObj.EdaRulebookDetails.replace(':id', rulebook.id.toString()))
            }
          />
        ),
        sort: 'name',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Number of rule sets'),
        cell: (rulebook) => (
          <TextCell text={`${rulebook?.ruleset_count ? rulebook.ruleset_count : 0}`} />
        ),
        sort: 'rule_count',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Fire count'),
        cell: (rulebook) => <TextCell text={`${rulebook?.fire_count ? rulebook.fire_count : 0}`} />,
        sort: 'fired_count',
        defaultSort: true,
        card: 'name',
        list: 'name',
      },
    ],
    [navigate, t]
  );
}
