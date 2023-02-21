import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../framework';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { useDisableRulebook } from './useDisableRulebook';

export function useRulebookActions(rulebook: EdaRulebook | undefined) {
  const { t } = useTranslation();
  const disableRulebook = useDisableRulebook();
  return useMemo<IPageAction<EdaRulebook>[]>(
    () => [
      {
        type: PageActionType.single,
        label: rulebook?.status === 'Disabled' ? t('Enable') : t('Disable'),
        onClick: (rulebook: EdaRulebook) => disableRulebook(rulebook),
      },
    ],
    [rulebook, disableRulebook, t]
  );
}
