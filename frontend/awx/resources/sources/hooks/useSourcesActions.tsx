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
import { InventorySource } from '../../../interfaces/InventorySource';
import { IAwxView } from '../../../common/useAwxView';
import { useDeleteSources } from './useDeleteSources';

export function useSourcesActions(view: IAwxView<InventorySource>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteSources = useDeleteSources(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<InventorySource>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit source'),
        onClick: (source) =>
          pageNavigate(AwxRoute.InventorySourceEdit, { params: { id: source.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete source'),
        onClick: (source) => deleteSources([source]),
        isDanger: true,
      },
    ],
    [pageNavigate, deleteSources, t]
  );
}
