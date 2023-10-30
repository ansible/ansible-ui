import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { RemoteRegistry } from '../RemoteRegistry';

export function useRemoteRegistryActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        icon: EditIcon,
        isPinned: true,
        label: t('Edit remote registry'),
        onClick: () => {},
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
      },
      { type: PageActionType.Seperator },
      {
        icon: TrashIcon,
        label: t('Delete remote registry'),
        onClick: () => {},
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t]
  );
}
