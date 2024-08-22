import { ButtonVariant } from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { useNavigate } from 'react-router-dom';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useManagementJobPrompt } from './useManagementJobPrompt';

export function useManagementJobRowActions() {
  const { t } = useTranslation();

  const openManagementJobsModal = useManagementJobPrompt();
  const postRequest = usePostRequest();
  const getJobOutputUrl = useGetJobOutputUrl();
  const navigate = useNavigate();

  const launchManagementJob = useCallback(
    async (managementJob: SystemJobTemplate) => {
      if (
        managementJob.job_type === 'cleanup_activitystream' ||
        managementJob.job_type === 'cleanup_jobs'
      ) {
        openManagementJobsModal({ id: managementJob.id });
      } else {
        const newJob = await postRequest(
          awxAPI`/system_job_templates/${String(managementJob.id)}/launch/`,
          {}
        );
        navigate(getJobOutputUrl(newJob as UnifiedJob));
      }
    },
    [openManagementJobsModal, getJobOutputUrl, navigate, postRequest]
  );

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    const actions: IPageAction<SystemJobTemplate>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Launch management job`),
        onClick: launchManagementJob,
      },
    ];
    return actions;
  }, [t, launchManagementJob]);
}
