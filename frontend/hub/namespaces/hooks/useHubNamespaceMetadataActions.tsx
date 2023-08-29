import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { HubNamespaceMetadataType } from '../HubNamespaceMetadataType';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

export function useHubNamespaceMetadataActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);
  return useMemo(() => {
    const actions: IPageAction<HubNamespaceMetadataType>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit namespace details'),
        onClick: (namespace) => {
          navigate(RouteObj.EditNamespaceDetails.replace(':id', namespace.metadata.name));
        },
      },
      { type: PageActionType.Seperator },
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
  }, [deleteHubNamespaces, navigate, t]);
}
