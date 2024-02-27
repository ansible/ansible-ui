import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Job } from '../../../interfaces/Job';
import { useCancelJobs } from './useCancelJobs';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInventoryJobsActions() {
  const { t } = useTranslation();
  const cancelJobs = useCancelJobs();
  const postRequest = usePostRequest<{ id: number }, Job>();
  const pageNagivate = usePageNavigate();

  return useMemo<IPageAction<Job>[]>(() => {
    const cannotCancelJobDueToStatus = (job: Job) =>
      ['pending', 'waiting', 'running'].includes(job.status ?? '')
        ? ''
        : t(`The job cannot be canceled because it is not running`);
    const cannotCancelJobDueToPermissions = (job: Job) =>
      job?.summary_fields?.user_capabilities?.start
        ? ''
        : t(`The job cannot be canceled due to insufficient permission`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        variant: ButtonVariant.secondary,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isDisabled: (job: Job) =>
          cannotCancelJobDueToPermissions(job) || cannotCancelJobDueToStatus(job),
        isHidden: (job: Job) => Boolean(cannotCancelJobDueToStatus(job)),
        onClick: (job: Job) => cancelJobs([job]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: RocketIcon,
        label: t('Relaunch Job'),
        isDisabled: (job: Job) => cannotCancelJobDueToPermissions(job),
        onClick: async (job: Job) => {
          const data = await postRequest(awxAPI`/jobs/${job?.id.toString() ?? ''}/relaunch/`, {
            id: job.id,
          });
          pageNagivate(AwxRoute.JobOutput, {
            params: { job_type: 'playbook', id: data?.id },
          });
        },
      },
    ];
  }, [t, cancelJobs, postRequest, pageNagivate]);
}
