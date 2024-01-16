import { PencilAltIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../api/awx-utils';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';

export function useInventoriesHostsActions(onComplete: (hosts: AwxHost[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const handleToggleHost: (host: AwxHost, enabled: boolean) => Promise<void> = useCallback(
    async (host, enabled) => {
      await requestPatch(awxAPI`/hosts/${host.id.toString()}/`, { enabled });
      onComplete([host]);
    },
    [onComplete]
  );

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
        selection: PageActionSelection.Single,
        onToggle: (host, enabled) => handleToggleHost(host, enabled),
        isSwitchOn: (host: AwxHost) => (host.enabled ? true : false),
        label: t('Enabled'),
        labelOff: t('Disabled'),
        showPinnedLabel: false,
        isPinned: true,
        isDisabled: (host) => cannotEditResource(host, t),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit host'),
        onClick: (host) => pageNavigate(AwxRoute.EditHost, { params: { id: host.id } }),
        isDisabled: (host) => cannotEditResource(host, t),
      },
    ],
    [pageNavigate, handleToggleHost, t]
  );
}
