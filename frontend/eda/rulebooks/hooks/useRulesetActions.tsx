import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaRuleset } from '../../interfaces/EdaRuleset';
import { useDisableRuleset } from './useDisableRuleset';

export function useRulesetActions(
  ruleset: EdaRuleset | undefined,
  refresh: () => Promise<unknown>
) {
  const { t } = useTranslation();
  const disableRuleset = useDisableRuleset(() => void refresh());
  return useMemo<IPageAction<EdaRuleset>[]>(
    () => [
      {
        type: PageActionType.single,
        label: ruleset?.status === 'Disabled' ? t('Enable') : t('Disable'),
        onClick: (ruleset: EdaRuleset) => disableRuleset(ruleset),
      },
    ],
    [ruleset, disableRuleset, t]
  );
}
