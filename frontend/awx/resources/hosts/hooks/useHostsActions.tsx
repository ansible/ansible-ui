import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useDeleteHosts } from './useDeleteHosts';
import { useParams } from 'react-router-dom';
import { requestPatch } from '../../../../common/crud/Data';
import { ButtonVariant } from '@patternfly/react-core';

export function useHostsActions(
  onDelete: (host: AwxHost[]) => void,
  onToggle: (host: AwxHost) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const deleteHosts = useDeleteHosts(onDelete);

  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const handleToggleHost: (host: AwxHost, enabled: boolean) => Promise<void> = useCallback(
    async (host, enabled) => {
      const patchedHost = await requestPatch<AwxHost>(awxAPI`/hosts/${host.id.toString()}/`, {
        enabled,
      });
      onToggle(patchedHost);
    },
    [onToggle]
  );

  const actions = useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable host') : t('Click to enable host'),
        selection: PageActionSelection.Single,
        onToggle: (host, enabled) => handleToggleHost(host, enabled),
        isSwitchOn: (host: AwxHost) => (host.enabled ? true : false),
        label: t('Host enabled'),
        labelOff: t('Host disabled'),
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
        variant: ButtonVariant.primary,
        label: t('Edit host'),
        onClick: (host) => {
          if (params.id && params.inventory_type) {
            pageNavigate(AwxRoute.InventoryHostEdit, {
              params: { id: params.id, inventory_type: params.inventory_type, host_id: host.id },
            });
          } else if (params.id) {
            pageNavigate(AwxRoute.EditHost, { params: { id: params.id } });
          } else {
            pageNavigate(AwxRoute.EditHost, { params: { id: host.id } });
          }
        },
        isDisabled: (host) => cannotEditResource(host, t),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete host'),
        isDisabled: (host: AwxHost) => cannotDeleteResource(host, t),
        onClick: (host) => {
          deleteHosts([host]);
        },
        isDanger: true,
      },
    ],
    [t, handleToggleHost, pageNavigate, params.id, params.inventory_type, deleteHosts]
  );

  if (
    params.inventory_type === 'smart_inventory' ||
    params.inventory_type === 'constructed_inventory'
  ) {
    return [];
  }

  return actions;
}
