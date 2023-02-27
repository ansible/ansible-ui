import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RemoteRegistry } from '../RemoteRegistry';

export function useRemoteRegistriesActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add remote registry'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  );
}
