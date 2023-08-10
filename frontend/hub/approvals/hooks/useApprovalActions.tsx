import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';
import { rejectCollection } from '../hooks/rejectCollection';
import { useGetRequest } from '../../../common/crud/useGetRequest';

export function useApprovalActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getRequest = useGetRequest();

  //const deleteCollections = useDeleteCollections(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Reject'),
        //onClick: (collection) => deleteCollections([collection]),
        onClick: (collection) => rejectCollection(collection, getRequest),
        isDanger: true,
      },
    ],
    [t, navigate]
  );
}
