import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { HubNamespaceMetadataType } from '../HubNamespaceMetadataType';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceDetailsToolbarActions() {
  const { t } = useTranslation();
  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);

  return useMemo<IPageAction<HubNamespaceMetadataType>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected namesapces'),
        onClick: deleteHubNamespaces,
        isDanger: true,
      },
    ],
    [deleteHubNamespaces, t]
  );
}
