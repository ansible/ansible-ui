import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';

export function useApprovalActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();

  const rejectCollections = useRejectCollections(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: TrashIcon,
        label: t('Reject'),
        onClick: (collection) => rejectCollections([collection]),
        isDanger: true,
      },
    ],
    [t, rejectCollections]
  );
}
