import { BanIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteJobs';

export function useJobToolbarActions(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const deleteJobs = useDeleteJobs(onComplete);
  const cancelJobs = useCancelJobs(onComplete);

  return useMemo<IPageAction<UnifiedJob>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected jobs'),
        onClick: deleteJobs,
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: BanIcon,
        label: t('Cancel selected jobs'),
        onClick: cancelJobs,
      },
    ],
    [deleteJobs, cancelJobs, t]
  );
}
