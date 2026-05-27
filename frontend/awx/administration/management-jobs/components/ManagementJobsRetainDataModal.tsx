import { PageFormSubmitHandler, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';

export interface ManagementJobsRetainDataModalProps {
  id: number;
}

export interface ManagementJobRetainDaysInput {
  extra_vars: {
    days: number;
  };
}

export function ManagementJobsRetainDataModal(
  props: ManagementJobsRetainDataModalProps & { popDialog: () => void }
) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<ManagementJobRetainDaysInput, SystemJobTemplate>();
  const navigate = useNavigate();
  const getJobOutputUrl = useGetJobOutputUrl();

  const onSubmit: PageFormSubmitHandler<ManagementJobRetainDaysInput> = async (
    retainInput: ManagementJobRetainDaysInput
  ) => {
    const newJob = await postRequest(
      awxAPI`/system_job_templates/${String(props.id)}/launch/`,
      retainInput
    );
    props.popDialog();
    void navigate(getJobOutputUrl(newJob as unknown as UnifiedJob));
  };

  const onCancel = () => props.popDialog();

  const MAX_RETENTION = 99999;
  const MIN_RETENTION = 0;

  return (
    <Modal
      aria-label={t`Launch management job`}
      variant={ModalVariant.small}
      position="default"
      isOpen
      onClose={() => props.popDialog()}
    >
      <ModalHeader title={t`Launch management job`} titleIconVariant="info" />
      <ModalBody>
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
            min={MIN_RETENTION}
            max={MAX_RETENTION}
          />
        </AwxPageForm>
      </ModalBody>
    </Modal>
  );
}
