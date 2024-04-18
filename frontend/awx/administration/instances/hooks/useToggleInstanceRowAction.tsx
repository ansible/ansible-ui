import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { Settings } from '../../../interfaces/Settings';

export function useToggleInstanceRowAction(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);

  const handleToggleInstance: (instance: Instance, enabled: boolean) => Promise<void> = useCallback(
    async (instance, enabled) => {
      await requestPatch(awxAPI`/instances/${instance.id.toString()}/`, { enabled });
      onComplete([instance]);
    },
    [onComplete]
  );
  const userAccess = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Switch,
      ariaLabel: (isEnabled) =>
        isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
      selection: PageActionSelection.Single,
      isPinned: true,
      onToggle: (instance, enabled) => handleToggleInstance(instance, enabled),
      isSwitchOn: (instance) => instance.enabled,
      label: t('Enabled'),
      labelOff: t('Disabled'),
      showPinnedLabel: false,
      isHidden: (instance) => instance.node_type === 'hop',
      isDisabled: (instance) =>
        !userAccess ||
        !isK8s ||
        (instance?.node_type !== 'execution' && instance?.node_type !== 'hop')
          ? t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            )
          : undefined,
    }),
    [t, handleToggleInstance, isK8s, userAccess]
  );
}
