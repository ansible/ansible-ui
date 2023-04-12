import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Collection } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';

export function useCollectionsActions(callback: (collections: Collection[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        label: t('Upload collection'),
        onClick: () => navigate(RouteObj.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected collections'),
        onClick: deleteCollections,
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Deprecate selected collections'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t, navigate, deleteCollections]
  );
}
