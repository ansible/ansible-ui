import { useCallback, useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { Instance } from '../../../interfaces/Instance';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { requestPatch } from '../../../../common/crud/Data';
import { RouteObj } from '../../../../Routes';
import { useNavigate } from 'react-router-dom';
import { useRunHealthCheck } from './useRunHealthCheck';

export function useInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const runHealthCheck = useRunHealthCheck(onComplete);
  const handleToggleInstance: (instance: Instance, enabled: boolean) => Promise<void> = useCallback(
    async (instance, enabled) => {
      await requestPatch(`/api/v2/instances/${instance.id}/`, { enabled });
      onComplete([instance]);
    },
    [onComplete]
  );
  return useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        isPinned: true,
        onToggle: (instance, enabled) => handleToggleInstance(instance, enabled),
        isSwitchOn: (instance) => instance.enabled,
        label: t('Enabled'),
        labelOff: t('Disabled'),
        showPinnedLabel: false,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        isDisabled: (instance) =>
          instance.node_type !== 'execution'
            ? t('Cannot run health check on a {{ type }} instance', { type: instance.node_type })
            : undefined,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instance: Instance) => runHealthCheck([instance]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: (instance) =>
          navigate(RouteObj.EditInstance.replace(':id', instance.id.toString())),
      },
    ],
    [runHealthCheck, navigate, handleToggleInstance, t]
  );
}
