import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { Repository } from '../Repository';

export function useRepositoryActions() {
  const { t } = useTranslation();
  const actions = useMemo<IPageAction<Repository>[]>(
    () => [
      {
        icon: EditIcon,
        isPinned: true,
        label: t('Edit repository'),
        onClick: () => {},
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      {
        type: PageActionType.Seperator,
      },
      {
        icon: TrashIcon,
        label: t('Delete repository'),
        onClick: () => {},
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t]
  );

  return actions;
}
