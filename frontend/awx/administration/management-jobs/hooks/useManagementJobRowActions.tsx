import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobPrompt } from './useManagementJobPrompt';
import { usePageNavigate } from '../../../../../framework';
// import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
//import { useLaunchManagementJob } from './useLaunchManagementJob';

export function useManagementJobRowActions(managementJob: SystemJobTemplate[]) {
  const { t } = useTranslation();
  const onManagementJobPrompt = useManagementJobPrompt(managementJob);
  // const activeUser = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    function handleManagementJob(managementJob: SystemJobTemplate) {
      if (
        managementJob.job_type &&
        ['cleanup_tokens', 'cleanup_sessions'].includes(managementJob.job_type)
      ) {
        console.log('Launching management job:', managementJob.job_type);
        pageNavigate(AwxRoute.JobOutput, { params: { id: managementJob.id } });
      } else {
        onManagementJobPrompt(managementJob);
      }
    }

    const rowActions: IPageAction<SystemJobTemplate>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch management job'),
        onClick: (managementJob: SystemJobTemplate) => handleManagementJob(managementJob),
        // isDisabled: !activeUser?.is_superuser,
        ouiaId: 'management-job-launch-button',
        isDanger: false,
        isPinned: true,
      },
    ];
    return rowActions;
  }, [onManagementJobPrompt, pageNavigate, t]);
}
//   return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
//     //console.log('Launching management job:', activeUser.is_superuser);
//     const rowActions: IPageAction<SystemJobTemplate>[] = [
//       {
//         type: PageActionType.Button,
//         selection: PageActionSelection.Single,
//         icon: RocketIcon,
//         label: t('Launch management job'),
//         onClick: (managementJob: SystemJobTemplate) => handleManagementJob(managementJob),
//         // isDisabled: !activeUser?.is_superuser,
//         ouiaId: 'management-job-launch-button',
//         isDanger: false,
//         isPinned: true,
//       },
//     ];
//     return rowActions;
//   }, [handleManagementJob, t]);
// }
