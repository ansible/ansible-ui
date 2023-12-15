import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWatch, useFormContext } from 'react-hook-form';
import { awxAPI } from '../../../../api/awx-utils';
import { PageFormSelect, PageFormTextInput } from '../../../../../../framework';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { useGetItem } from '../../../../../common/crud/useGet';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { PageFormManagementJobsSelect } from '../../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import type { WorkflowNodeWizardData } from './NodeWizard';
import type { SystemJobTemplate } from '../../../../interfaces/SystemJobTemplate';
import type { UnifiedJobType } from '../../../../interfaces/WorkflowNode';

export function NodeDetailsStep() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const {
    reset,
    getValues,
    formState: { defaultValues },
  } = useFormContext<WorkflowNodeWizardData>();
  // Need to handle cases where we are adding a new node.  The user should be able to select a parent node.
  // A parent node is not required though.

  const nodeType = useWatch({ name: 'node_type' }) as UnifiedJobType;

  useEffect(() => {
    if (defaultValues?.node_type !== nodeType) {
      reset(
        {
          node_type: nodeType,
          node_resource: {
            name: '',
            id: 0,
            description: '',
            unified_job_type: nodeType,
          },
          convergence: getValues('convergence'),
          alias: getValues('alias'),
        },
        { keepDefaultValues: true }
      );
    }
  }, [defaultValues, nodeType, reset, getValues]);

  return (
    <>
      <PageFormSelect<WorkflowNodeWizardData>
        isRequired
        label={t('Node type')}
        name="node_type"
        data-cy="node_type"
        options={[
          { label: t('Job Template'), value: 'job' },
          { label: t('Workflow Job Template'), value: 'workflow_job' },
          { label: t('Approval'), value: 'workflow_approval' },
          { label: t('Project Sync'), value: 'project_update' },
          { label: t('Inventory Source Sync'), value: 'inventory_update' },
          { label: t('Management Job'), value: 'system_job' },
        ]}
      />
      {
        {
          job: (
            <PageFormJobTemplateSelect<WorkflowNodeWizardData> name="node_resource" isRequired />
          ),
          workflow_job: (
            <PageFormJobTemplateSelect<WorkflowNodeWizardData>
              templateType="workflow_job_templates"
              name="node_resource"
              isRequired
            />
          ),
          workflow_approval: (
            <>
              <PageFormTextInput<WorkflowNodeWizardData>
                label={t('Name')}
                name="name"
                id="workflow-approval-name"
                isRequired
              />
              <PageFormTextInput<WorkflowNodeWizardData>
                label={t('Description')}
                name="description"
                id="workflow-approval-description"
              />

              <PageFormTextInput<WorkflowNodeWizardData>
                label={t('Minutes')}
                name="timeout_minutes"
                type="number"
                id="workflow-approval-timeout-minutes"
              />
              <PageFormTextInput<WorkflowNodeWizardData>
                label={t('Seconds')}
                name="timeout_seconds"
                type="number"
                id="workflow-approval-timeout-seconds"
              />
            </>
          ),
          project_update: (
            <PageFormProjectSelect<WorkflowNodeWizardData> name="node_resource" isRequired />
          ),
          inventory_update: (
            <PageFormInventorySourceSelect<WorkflowNodeWizardData>
              name="node_resource"
              isRequired
            />
          ),
          system_job: <SystemJobInputs />,
        }[nodeType]
      }
      <PageFormSelect
        label={t('Convergence')}
        name="convergence"
        data-cy="convergence"
        isRequired
        labelHelpTitle={t('Convergence')}
        labelHelp={
          <>
            {t('Preconditions for running this node when there are multiple parents')}{' '}
            <a
              href={`${getDocsBaseUrl(
                config
              )}/html/userguide/workflow_templates.html#convergence-node`}
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
      <PageFormTextInput
        label={t('Node alias')}
        name="alias"
        data-cy="alias"
        labelHelpTitle={t('Node alias')}
        labelHelp={t('Node alias to use for this node.')}
      />
    </>
  );
}

function SystemJobInputs() {
  const { t } = useTranslation();
  const { setWizardData } = usePageWizard();

  const systemJobTemplate = useWatch({
    name: 'node_resource',
  }) as SystemJobTemplate;

  const { data } = useGetItem<SystemJobTemplate>(
    awxAPI`/system_job_templates/`,
    systemJobTemplate?.id
  );

  const showDaysToKeep = ['cleanup_jobs', 'cleanup_activitystream'].includes(data?.job_type || '');
  useEffect(() => {
    if (showDaysToKeep) {
      setWizardData((prev: WorkflowNodeWizardData) => ({ ...prev, showDaysToKeep: true }));
    }
  }, [showDaysToKeep, setWizardData]);

  return (
    <>
      <PageFormManagementJobsSelect<WorkflowNodeWizardData> name="node_resource" isRequired />
      {showDaysToKeep && (
        <PageFormTextInput
          name="days_to_keep"
          label={t('Days of data to be retained')}
          placeholder={t('Enter number of days')}
          type="number"
          isRequired
          min={0}
        />
      )}
    </>
  );
}
