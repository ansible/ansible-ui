import { ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { useHubContext } from '../../../common/useHubContext';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';

export function useApprovalsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const rejectCollections = useRejectCollections(callback);
  const { featureFlags } = useHubContext();
  const { collection_auto_sign, require_upload_signatures } = featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Reject selected collections'),
        onClick: rejectCollections,
        isDanger: true,
      },
      { type: PageActionType.Seperator },
    ],
    [t, rejectCollections, autoSign]
  );
}
