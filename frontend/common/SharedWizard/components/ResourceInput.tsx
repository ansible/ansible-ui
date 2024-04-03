import { useTranslation } from 'react-i18next';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { RESOURCE_TYPE } from '../../../awx/resources/templates/WorkflowVisualizer/constants';
import { WizardFormValues } from '../../../awx/resources/templates/WorkflowVisualizer/types';
import { PageFormJobTemplateSelect } from '../../../awx/resources/templates/components/PageFormJobTemplateSelect';
import { PageFormGrid, PageFormTextInput } from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { InputGroup, InputGroupItem, InputGroupText, TextInput } from '@patternfly/react-core';
import { Controller, useFormContext, FieldPath } from 'react-hook-form';
import { PageFormProjectSelect } from '../../../awx/resources/projects/components/PageFormProjectSelect';
import { PageFormInventorySourceSelect } from '../../../awx/resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormManagementJobsSelect } from '../../../awx/administration/management-jobs/components/PageFormManagementJobsSelect';
import { AwxItemsResponse } from '../../../awx/common/AwxItemsResponse';
import { SystemJobTemplate } from '../../../awx/interfaces/SystemJobTemplate';
import { awxAPI } from '../../../awx/common/api/awx-utils';
import { useGet } from '../../crud/useGet';

export function ResourceInput() {
  const { t } = useTranslation();
  return (
    <PageFormWatch watch="resource_type">
      {(nodeType) => {
        switch (nodeType) {
          case RESOURCE_TYPE.job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="job_templates"
                name="resource"
                isRequired
              />
            );
          case RESOURCE_TYPE.workflow_job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="workflow_job_templates"
                name="resource"
                isRequired
              />
            );
          case RESOURCE_TYPE.workflow_approval:
            return (
              <>
                <PageFormTextInput<WizardFormValues>
                  label={t('Name')}
                  name="approval_name"
                  id="approval_name"
                  isRequired
                />
                <PageFormTextInput<WizardFormValues>
                  label={t('Description')}
                  name="approval_description"
                  id="approval_description"
                />
                <TimeoutInputs />
              </>
            );
          case RESOURCE_TYPE.project_update:
            return <PageFormProjectSelect<WizardFormValues> name="resource" isRequired />;
          case RESOURCE_TYPE.inventory_update:
            return <PageFormInventorySourceSelect<WizardFormValues> name="resource" isRequired />;
          case RESOURCE_TYPE.system_job:
            return (
              <>
                <PageFormManagementJobsSelect<WizardFormValues> name="resource" isRequired />
                <SystemJobInputs />
              </>
            );
          default:
            return;
        }
      }}
    </PageFormWatch>
  );
}
function SystemJobInputs() {
  const { t } = useTranslation();
  const { data } = useGet<AwxItemsResponse<SystemJobTemplate>>(awxAPI`/system_job_templates/`);

  const showDaysToKeep = (systemJobTemplate: SystemJobTemplate) => {
    const jobType =
      systemJobTemplate?.job_type ||
      data?.results.find((result) => systemJobTemplate?.id === result?.id)?.job_type;
    return ['cleanup_jobs', 'cleanup_activitystream'].includes(jobType || '');
  };

  return (
    <PageFormWatch watch="resource">
      {(systemJobTemplate: SystemJobTemplate) => {
        if (!showDaysToKeep(systemJobTemplate)) return null;

        return (
          <PageFormTextInput<WizardFormValues>
            name="node_days_to_keep"
            label={t('Days of data to be retained')}
            placeholder={t('Enter number of days')}
            type="number"
            isRequired
            min={0}
          />
        );
      }}
    </PageFormWatch>
  );
}
function TimeoutInputs() {
  const { t } = useTranslation();
  const { control } = useFormContext<WizardFormValues>();

  return (
    <Controller<WizardFormValues, FieldPath<WizardFormValues>>
      name="approval_timeout"
      control={control}
      shouldUnregister
      render={({ field }) => {
        const { onChange, value } = field;

        function timeToSeconds(minutes: number, seconds: number) {
          return minutes * 60 + seconds;
        }

        function onChangeHandler({ input, unit }: { input: number; unit: 'minutes' | 'seconds' }) {
          const totalApprovalTimeout = timeToSeconds(
            unit === 'minutes' ? input : Math.floor(Number(value) / 60),
            unit === 'seconds' ? input : Math.floor(Number(value) % 60)
          );
          onChange(totalApprovalTimeout);
        }

        return (
          <PageFormGroup fieldId="approval_timeout" label={t('Timeout')}>
            <InputGroup>
              <PageFormGrid>
                <InputGroupItem isFill>
                  <TextInput
                    placeholder={t('Timeout in minutes')}
                    onChange={(_event, value: string) =>
                      onChangeHandler({ input: Number(value), unit: 'minutes' })
                    }
                    value={Math.floor(Number(value) / 60)}
                    aria-describedby="approval_timeout_minutes-form-group"
                    type="number"
                    data-cy="approval_timeout_minutes"
                    min={0}
                  />
                  <InputGroupText>{t('minutes')}</InputGroupText>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <TextInput
                    placeholder={t('Timeout in seconds')}
                    onChange={(_event, value: string) =>
                      onChangeHandler({ input: Number(value), unit: 'seconds' })
                    }
                    value={Math.floor(Number(value) % 60)}
                    aria-describedby="approval_timeout_seconds-form-group"
                    type="number"
                    data-cy="approval_timeout_seconds"
                    min={0}
                  />
                  <InputGroupText>{t('seconds')}</InputGroupText>
                </InputGroupItem>
              </PageFormGrid>
            </InputGroup>
          </PageFormGroup>
        );
      }}
    />
  );
}
