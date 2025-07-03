import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { cannotEditResource } from '@ansible/common-ui/utils/RBAChelpers';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInventoriesGroupsHostsActions(onToggle: (() => Promise<void>) | (() => void)) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const patchRequest = usePatchRequest<{ enabled: boolean }, AwxHost>();

  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const handleToggleHost: (host: AwxHost, enabled: boolean) => Promise<void> = useCallback(
    async (host, enabled) => {
      await patchRequest(awxAPI`/hosts/${host.id.toString()}/`, { enabled });
      await onToggle();
      return Promise.resolve();
    },
    [onToggle, patchRequest]
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
        onClick: (host) =>
          pageNavigate(AwxRoute.InventoryHostEdit, {
            params: { id: params.id, inventory_type: params.inventory_type, host_id: host.id },
          }),
        isDisabled: (host) => cannotEditResource(host, t),
        isHidden: (_host) => params.inventory_type === 'constructed_inventory',
      },
    ],
    [t, handleToggleHost, pageNavigate, params.id, params.inventory_type]
  );
}
