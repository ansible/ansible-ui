import { ButtonVariant } from '@patternfly/react-core';
import { TrashIcon, UploadIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Collection } from '../Collection';
import { useDeleteCollections } from './useDeleteCollections';

export function useCollectionActions(callback?: (collections: Collection[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCollections = useDeleteCollections(callback);
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: t('Upload new version'),
        onClick: () => navigate(RouteObj.UploadCollection),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete entire collection'),
        onClick: (collection) => deleteCollections([collection]),
        isDanger: true,
      },
      // {
      //   type: PageActionType.Button,
      // selection: PageActionSelection.None,
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
