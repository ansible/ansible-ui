import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Collection } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';

export function useCollectionsActions(callback: (collections: Collection[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.button,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        label: t('Upload collection'),
        onClick: () => navigate(RouteE.UploadCollection),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected collections'),
        onClick: deleteCollections,
        isDanger: true,
      },
      {
        type: PageActionType.bulk,
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
