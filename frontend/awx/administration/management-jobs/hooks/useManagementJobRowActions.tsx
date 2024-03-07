import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useLaunchManagementJob } from './useLaunchManagementJob';

export function useManagementJobRowActions() {
  const { t } = useTranslation();
  const launchManagementJob = useLaunchManagementJob();

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    const rowActions: IPageAction<SystemJobTemplate>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch management job'),
        onClick: (job: SystemJobTemplate) => void launchManagementJob(job),
        ouiaId: 'management-job-launch-button',
        isDanger: false,
        isPinned: true,
      },
    ];
    return rowActions;
  }, [launchManagementJob, t]);
}
