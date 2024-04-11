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

export function ManagementJobsRetainDataModal(
  props: ManagementJobsRetainDataModalProps & { popDialog: () => void }
) {
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
      variant="small"
      position="default"
      title={t`Launch management job`}
      titleIconVariant="info"
      hasNoBodyWrapper
      isOpen
      onClose={() => props.popDialog()}
    >
      <AwxPageForm
        submitText={t('Launch')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        singleColumn
        defaultValue={{ extra_vars: { days: 30 } }}
      >
        <span>{t('Set how many days of data should be retained.')}</span>
        <PageFormTextInput
          name="extra_vars.days"
          label={t('Retention Days')}
          placeholder={t('Enter days')}
          isRequired
          type="number"
          min={0}
          max={99999}
        />
      </AwxPageForm>
    </Modal>
  );
}
