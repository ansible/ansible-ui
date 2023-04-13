import { EditIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RemoteRegistry } from '../RemoteRegistry';

export function useRemoteRegistryActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  );
}
