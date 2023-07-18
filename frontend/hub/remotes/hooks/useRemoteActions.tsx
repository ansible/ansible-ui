import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { PlusIcon } from '@patternfly/react-icons';
import { ButtonVariant } from '@patternfly/react-core';
import { Remotes } from '../Remotes';

export function useRemoteActions() {
  const { t } = useTranslation();
  const actions = useMemo<IPageAction<Remotes>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.None,
        label: t('Create remote'),
        icon: PlusIcon,
        onClick: () => {
          // eslint-disable-next-line no-console
          console.log('create remote');
        },
        isPinned: true,
      },
    ],
    [t]
  );

  return actions;
}
