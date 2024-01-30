import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { InputGroup, InputGroupItem, InputGroupText, TextInput } from '@patternfly/react-core';
import { PageFormGroup } from '../../../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormGrid, PageFormSelect, PageFormTextInput } from '../../../../../../framework';
import { PageFormWatch } from '../../../../../../framework/PageForm/Utils/PageFormWatch';
import { getDocsBaseUrl } from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { PageFormManagementJobsSelect } from '../../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import { SystemJob } from '../../../../interfaces/generated-from-swagger/api';
import type { WizardFormValues } from '../types';

export function NodeTypeStep() {
  const {
    reset,
    getValues,
    formState: { defaultValues },
  } = useFormContext<WizardFormValues>();
  const nodeType = useWatch({ name: 'node_type' }) as UnifiedJobType;

  useEffect(() => {
    if (defaultValues?.node_type !== nodeType) {
      reset(
        {
          node_type: nodeType,
          node_resource: null,
          node_convergence: getValues('node_convergence'),
          approval_timeout: getValues('approval_timeout'),
          approval_name: getValues('approval_name'),
          approval_description: getValues('approval_description'),
          node_alias: getValues('node_alias'),
        },
        { keepDefaultValues: true }
      );
    }
  }, [nodeType, reset, defaultValues, getValues]);

  return (
    <>
      <NodeTypeInput />
      <NodeResourceInput />
      <ConvergenceInput />
      <AliasInput />
    </>
  );
}

function NodeTypeInput() {
  const { t } = useTranslation();
  return (
    <PageFormSelect<WizardFormValues>
      isRequired
      label={t('Node type')}
      name="node_type"
      data-cy="node_type"
      options={[
        { label: t('Job Template'), value: UnifiedJobType.job },
        { label: t('Workflow Job Template'), value: UnifiedJobType.workflow_job },
        { label: t('Approval'), value: UnifiedJobType.workflow_approval },
        { label: t('Project Sync'), value: UnifiedJobType.project_update },
        { label: t('Inventory Source Sync'), value: UnifiedJobType.inventory_update },
        { label: t('Management Job'), value: UnifiedJobType.system_job },
      ]}
    />
  );
}

function NodeResourceInput() {
  const { t } = useTranslation();
  return (
    <PageFormWatch watch="node_type">
      {(nodeType) => {
        switch (nodeType) {
          case UnifiedJobType.job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="job_templates"
                name="node_resource"
                isRequired
              />
            );
          case UnifiedJobType.workflow_job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="workflow_job_templates"
                name="node_resource"
                isRequired
              />
            );
          case UnifiedJobType.workflow_approval:
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
          case UnifiedJobType.project_update:
            return <PageFormProjectSelect<WizardFormValues> name="node_resource" isRequired />;
          case UnifiedJobType.inventory_update:
            return (
              <PageFormInventorySourceSelect<WizardFormValues> name="node_resource" isRequired />
            );
          case UnifiedJobType.system_job:
            return (
              <>
                <PageFormManagementJobsSelect<WizardFormValues> name="node_resource" isRequired />
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
  return (
    <PageFormWatch watch="node_resource">
      {(systemJob: SystemJob) => {
        const showDaysToKeep = ['cleanup_jobs', 'cleanup_activitystream'].includes(
          systemJob?.job_type || ''
        );

        if (!showDaysToKeep) return null;

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
                    placeholder="Timeout in minutes"
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
                    placeholder="Timeout in_seconds"
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

function ConvergenceInput() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <PageFormSelect<WizardFormValues>
      isRequired
      label={t('Convergence')}
      name="node_convergence"
      data-cy="node_convergence"
      labelHelpTitle={t('Convergence')}
      labelHelp={
        <>
          {t('Preconditions for running this node when there are multiple parents')}{' '}
          <a
            href={`${getDocsBaseUrl(config)}/html/userguide/workflow_templates.html#converge-node`}
          >
            {t('documentation.')}
          </a>
        </>
      }
      options={[
        {
          label: t('Any'),
          value: 'any',
          description: t(
            'Ensures that at least one parent node met the expected outcome in order to run the child node.'
          ),
        },
        {
          label: t('All'),
          value: 'all',
          description: t(
            'Ensures that every parent node met the expected outcome in order to run the child node.'
          ),
        },
      ]}
    />
  );
}

function AliasInput() {
  const { t } = useTranslation();
  const {
    formState: { defaultValues },
  } = useFormContext<WizardFormValues>();
  const isAliasRequired = defaultValues?.node_alias !== '';

  return (
    <PageFormTextInput<WizardFormValues>
      label={t('Node alias')}
      name="node_alias"
      data-cy="node-alias"
      labelHelpTitle={t('Node alias')}
      labelHelp={t(
        'If specified, this field will be shown on the node instead of the resource name when viewing the workflow'
      )}
      isRequired={isAliasRequired}
    />
  );
}
