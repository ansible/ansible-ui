import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { IAwxView } from '../../../common/useAwxView';
import { useDeleteHosts } from './useDeleteHosts';

export function useHostsActions(view: IAwxView<AwxHost>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit host'),
        onClick: (host) => pageNavigate(AwxRoute.EditHost, { params: { id: host.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete host'),
        onClick: (host) => deleteHosts([host]),
        isDanger: true,
      },
    ],
    [pageNavigate, deleteHosts, t]
  );
}
