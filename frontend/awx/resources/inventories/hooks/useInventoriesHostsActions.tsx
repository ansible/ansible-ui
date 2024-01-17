import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useDeleteHosts } from '../../hosts/hooks/useDeleteHosts';

export function useInventoriesHostsActions(onComplete: (hosts: AwxHost[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const deleteHosts = useDeleteHosts(onComplete);

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
        tooltip: t(
          'Indicates if a host is available and should be included in running jobs. For hosts that are part of an external inventory, this may be reset by the inventory sync process.'
        ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit host'),
        // Need to update routing to go to inventory host edit form when that will be implemented AAP-8309
        onClick: (host) => pageNavigate(AwxRoute.EditHost, { params: { id: host.id } }),
        isDisabled: (host) => cannotEditResource(host, t),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        isDisabled: (host: AwxHost) => cannotDeleteResource(host, t),
        onClick: (host) => deleteHosts([host]),
        isDanger: true,
      },
    ],
    [t, handleToggleHost, pageNavigate, deleteHosts]
  );
}
