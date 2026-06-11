import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IUIFlag } from './IUIFlag';
import { useUIFlags } from './useUIFlags';

export function useUIFlagRowActions(): IPageAction<IUIFlag>[] {
  const { t } = useTranslation();
  const { flags, setFlags } = useUIFlags();

  return useMemo<IPageAction<IUIFlag>[]>(
    () => [
      {
        type: PageActionType.Switch,
        onToggle: (flag) => {
          flag.enabled = !flag.enabled;
          setFlags([...flags]);
        },
        isSwitchOn: (featureFlag) => !!featureFlag.enabled,
        ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
        selection: PageActionSelection.Single,
        label: '',
        isPinned: true,
      },
    ],
    [flags, setFlags, t]
  );
}
