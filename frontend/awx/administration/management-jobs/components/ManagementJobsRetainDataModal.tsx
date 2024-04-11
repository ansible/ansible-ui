import { t } from 'i18next';
import { useState, useEffect } from 'react';
import { PageFormSubmitHandler, PageFormTextInput, usePageDialogs } from '../../../../../framework';
import { Modal } from '@patternfly/react-core';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { awxAPI } from '../../../common/api/awx-utils';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { useNavigate } from 'react-router-dom';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export interface ManagementJobsRetainDataModalProps {
  id: number;
}

export function ManagementJobsRetainDataModal(props: { id: number; popDialog: () => void }) {
  const postRequest = usePostRequest<{ extra_vars: { days: number } }, SystemJobTemplate>();
  const navigate = useNavigate();
  const getJobOutputUrl = useGetJobOutputUrl();

  const onSubmit: PageFormSubmitHandler<{ extra_vars: { days: number } }> = async (retainInput: {
    extra_vars: { days: number };
  }) => {
    const newJob = await postRequest(
      awxAPI`/system_job_templates/${String(props.id)}/launch/`,
      retainInput
    );
    props.popDialog();
    const jobUrl = getJobOutputUrl(newJob as unknown as UnifiedJob);
    navigate(jobUrl);
  };

  const onCancel = () => props.popDialog();

  return (
    <Modal
      aria-label={t`Launch management job`}
      variant="medium"
      position="default"
      title={t`Launch management job`}
      hasNoBodyWrapper
      isOpen
    >
      <AwxPageForm
        submitText={t('Launch')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <PageFormTextInput
          name="extra_vars.days"
          label={t('Set how many days of data should be retained.')}
          placeholder={t('Enter days')}
          isRequired
          maxLength={150}
        />
      </AwxPageForm>
    </Modal>
  );
}

export function useManagementJobsRetainDataModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<ManagementJobsRetainDataModalProps>();
  useEffect(() => {
    if (props) {
      pushDialog(<ManagementJobsRetainDataModal {...{ ...props, popDialog: popDialog }} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);
  return setProps;
}
