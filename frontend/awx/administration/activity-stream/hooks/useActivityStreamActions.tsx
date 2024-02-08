import { ButtonVariant } from '@patternfly/react-core';
import { SearchPlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { useActivityStreamDialog } from './useActivityStreamDialog';

export function useActivityStreamActions() {
  const { t } = useTranslation();
  const showActivityStreamDialog = useActivityStreamDialog();

  return useMemo(() => {
    const actions: IPageAction<ActivityStream>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: SearchPlusIcon,
        label: t('View event details'),
        onClick: (activity: ActivityStream) => showActivityStreamDialog({ activity }),
      },
    ];
    return actions;
  }, [t, showActivityStreamDialog]);
}
