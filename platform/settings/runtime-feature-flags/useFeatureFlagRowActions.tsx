import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IFeatureFlag } from './IFeatureFlag';
import { useFeatureFlagToggleModal } from './useFeatureFlagToggleModal';

export function useFeatureFlagRowActions(options: {
  refresh: () => void;
}): IPageAction<IFeatureFlag>[] {
  const { t } = useTranslation();
  const openToggleModal = useFeatureFlagToggleModal();

  return useMemo<IPageAction<IFeatureFlag>[]>(
    () => [
      {
        type: PageActionType.Switch,
        onToggle: (flag) => {
          openToggleModal({
            flag,
            enable: !flag.state,
            onComplete: options.refresh,
          });
        },
        isSwitchOn: (flag) => flag.state,
        isDisabled: (flag) => {
          if (flag.toggle_type === 'install-time')
            return t('This is an install-time flag and cannot be toggled at runtime.');
          return undefined;
        },
        ariaLabel: (isEnabled: boolean) => (isEnabled ? t('Enabled') : t('Disabled')),
        selection: PageActionSelection.Single,
        label: '',
        isPinned: true,
      },
    ],
    [t, openToggleModal, options.refresh]
  );
}
