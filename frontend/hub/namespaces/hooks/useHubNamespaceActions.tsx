import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);

  return useMemo(() => {
    const actions: IPageAction<HubNamespace>[] = [
      // {
      //   type: PageActionType.Button,
      //   selection: PageActionSelection.Single,
      //   variant: ButtonVariant.primary,
      //   isPinned: true,
      //   icon: EditIcon,
      //   label: t('Edit namespace'),
      //   onClick: (namespace) =>
      //     navigate(RouteObj.EditHubNamespace.replace(':id', namespace.id.toString())),
      // },
      // { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete namespace'),
        onClick: (namespace) => deleteHubNamespaces([namespace]),
        isDanger: true,
      },
    ];
    return actions;
  }, [deleteHubNamespaces, t]);
}
