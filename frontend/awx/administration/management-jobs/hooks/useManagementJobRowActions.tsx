import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { ButtonVariant } from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
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
        void navigate(getJobOutputUrl(newJob as UnifiedJob));
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
