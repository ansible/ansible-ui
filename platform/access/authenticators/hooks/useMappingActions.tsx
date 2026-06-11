import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { CogIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteMappings } from './useDeleteMappings';
import { useManageMappings } from './useManageMappings';

export function useMappingToolbarActions(view: IPlatformView<AuthenticatorMap>, mapId: string) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { id } = useParams<{ id: string }>();

  const deleteMappings = useDeleteMappings(view.unselectItemsAndRefresh);
  const { openManageMappingOrder } = useManageMappings(Number(id), view.refresh);

  const toolbarActions = useMemo<IPageAction<AuthenticatorMap>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create mapping'),
        href: getPageUrl(PlatformRoute.CreateAuthenticatorMapping, { params: { id: mapId } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: CogIcon,
        label: t('Manage mappings'),
        onClick: openManageMappingOrder,
        isPinned: true,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete mappings'),
        onClick: deleteMappings,
        isDanger: true,
      },
    ],
    [t, getPageUrl, mapId, openManageMappingOrder, deleteMappings]
  );

  return toolbarActions;
}

export function useMappingRowActions(onMappingDeleted: (maps: AuthenticatorMap[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteMappings = useDeleteMappings(onMappingDeleted);

  const rowActions = useMemo<IPageAction<AuthenticatorMap>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit mapping'),
        onClick: (map: AuthenticatorMap) =>
          pageNavigate(PlatformRoute.EditAuthenticatorMapping, {
            params: { id: map.authenticator, map_id: map.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete mapping'),
        onClick: (map: AuthenticatorMap) => deleteMappings([map]),
        isDanger: true,
      },
    ];
  }, [deleteMappings, pageNavigate, t]);

  return rowActions;
}

export function useMappingPageActions(onMappingDeleted: (maps: AuthenticatorMap[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteMappings = useDeleteMappings(onMappingDeleted);

  const pageActions = useMemo<IPageAction<AuthenticatorMap>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        label: t('Edit mapping'),
        onClick: (map: AuthenticatorMap) =>
          pageNavigate(PlatformRoute.EditAuthenticatorMapping, {
            params: { id: map.authenticator, map_id: map.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete mapping'),
        onClick: (map: AuthenticatorMap) => deleteMappings([map]),
        isDanger: true,
      },
    ];
  }, [deleteMappings, pageNavigate, t]);

  return pageActions;
}
