import { useTranslation } from 'react-i18next';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { PageFormSelect, PageFormTextInput } from '../../../../../../framework';
import getDocsBaseUrl from '../../../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { NodeFields } from './NodeFormInputs';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { PageFormManagementJobsSelect } from '../../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { useWatch, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';

export function NodeTypeStep() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const {
    reset,
    getValues,
    formState: { defaultValues },
  } = useFormContext<NodeFields>();
  // Need to handle cases where we are adding a new node.  The user should be able to select a parent node.
  // A parent node is not required though.

  const nodeType = useWatch({ name: 'node_type' }) as
    | 'job'
    | 'workflow_job'
    | 'workflow_approval'
    | 'project_update'
    | 'inventory_update'
    | 'system_job';

  useEffect(() => {
    if (defaultValues?.node_resource?.unified_job_type !== nodeType) {
      reset(
        {
          node_type: nodeType,
          node_resource: {
            name: '',
            description: '',
            unified_job_type: nodeType as UnifiedJobType,
            id: undefined,
          },
          node_status_type: getValues('node_status_type'),
          all_parents_must_converge: getValues('all_parents_must_converge'),
          identifier: getValues('identifier'),
        },
        { keepDefaultValues: true }
      );
      return;
    }
    reset({ ...defaultValues }, { keepDefaultValues: true });
  }, [defaultValues, nodeType, reset, getValues]);
  return (
    <>
      <PageFormSelect<NodeFields>
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
          job: <PageFormJobTemplateSelect<NodeFields> name="node_resource" isRequired />,
          workflow_job: (
            <PageFormJobTemplateSelect<NodeFields>
              templateType="workflow_job_templates"
              name="node_resource"
              isRequired
            />
          ),
          workflow_approval: (
            <>
              <PageFormTextInput<NodeFields>
                label={t('Name')}
                name="node_resource.name"
                isRequired
              />
              <PageFormTextInput<NodeFields>
                label={t('Description')}
                name="node_resource.description"
              />

              <PageFormTextInput<NodeFields>
                label={t('Minutes')}
                name="node_resource.timeout_minute"
                type="number"
              />
              <PageFormTextInput<NodeFields>
                label={t('Seconds')}
                name="node_resource.timeout_seconds"
                type="number"
              />
            </>
          ),
          project_update: <PageFormProjectSelect<NodeFields> name="node_resource" isRequired />,
          inventory_update: (
            <PageFormInventorySourceSelect<NodeFields> name="node_resource" isRequired />
          ),
          system_job: <PageFormManagementJobsSelect<NodeFields> name="node_resource" isRequired />,
        }[nodeType]
      }
      <PageFormSelect
        label={t('Status')}
        data-cy="node_status_type"
        name="node_status_type"
        isRequired
        options={[
          {
            label: t('Always run'),
            value: 'always',
            description: t('Execute regardless of the parent node final state.'),
          },
          {
            label: t('Run on success'),
            value: 'success',
            description: t('Execute when the parent node results in a successful state.'),
          },
          {
            label: t('Run on failure'),
            value: 'failure',
            description: t('Execute when the parent node results in a failure state.'),
          },
        ]}
      />
      <PageFormSelect
        label={t('Convergence')}
        name="all_parents_must_converge"
        data-cy="all_parents_must_converge"
        isRequired
        labelHelpTitle={t('Convergence')}
        labelHelp={
          <>
            {t('Preconditions for running this node when there are multiple parents')}{' '}
            <a
              href={`${getDocsBaseUrl(
                config
              )}/html/userguide/workflow_templates.html#converge-node`}
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
        name="identifier"
        data-cy="alias"
        labelHelpTitle={t('Node alias')}
        labelHelp={t('Node alias to use for this node.')}
      />
    </>
  );
}
