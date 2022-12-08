import { ButtonVariant } from '@patternfly/react-core';
import { TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Collection } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';

export function useCollectionActions(callback?: (collections: Collection[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: t('Upload new version'),
        onClick: () => navigate(RouteE.UploadCollection),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete entire collection'),
        onClick: (collection) => deleteCollections([collection]),
      },
      // {
      //   type: PageActionType.button,
      //   icon: BanIcon,
      //   label: t('Deprecate collection'),
      //   onClick: () => {
      //     /**/
      //   },
      // },
    ],
    [t, navigate, deleteCollections]
  );
}
