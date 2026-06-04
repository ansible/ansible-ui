import { PageWizard, PageWizardStep, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { action, useVisualizationController } from '@patternfly/react-topology';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { SurveyStep } from '../../../../common/SurveyStep';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { RESOURCE_TYPE } from '../constants';
import { useCloseSidebar, useGetInitialValues } from '../hooks';
import type { GraphNode, GraphNodeData, PromptFormValues, WizardFormValues } from '../types';
import { buildEffectivePrompt } from './buildEffectivePrompt';
import {
  getNodeLabel,
  getValueBasedOnJobType,
  hasDaysToKeep,
  replaceIdentifier,
  shouldHideOtherStep,
} from './helpers';
import { NodePromptsStep } from './NodePromptsStep';
import { NodeReviewStep } from './NodeReviewStep';
import { NodeTypeStep } from './NodeTypeStep';
import {
  validateJobTemplateRequirements,
  validateRequiredCredentialTypes,
} from './validationHelpers';

type StepContent = Partial<WizardFormValues> | { prompt: Partial<PromptFormValues> };
type StepName = 'nodeTypeStep' | 'nodePromptsStep';
type WizardStep = Record<StepName, StepContent>;

export function NodeEditWizard({ node }: { node: GraphNode }) {
  const { t } = useTranslation();
  const controller = useVisualizationController();
  const closeSidebar = useCloseSidebar();
  const getInitialValues = useGetInitialValues();
  const [initialValues, setInitialValues] = useState<WizardStep | null>(null);

  const alertToaster = usePageAlertToaster();

  useEffect(() => {
    async function fetchValues() {
      if (!node) return;
      try {
        const value = await getInitialValues(node);
        setInitialValues(value as WizardStep);
      } catch (error) {
        const { genericErrors, fieldErrors } = awxErrorAdapter(error);
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to get default node values.'),
          children: (
            <>
              {genericErrors?.map((err) => err.message)}
              {fieldErrors?.map((err) => err.message)}
            </>
          ),
        });
      }
    }
    void fetchValues();
  }, [node, getInitialValues, alertToaster, t]);

  if (!initialValues || 'nodeTypeStep' in initialValues === false) {
    return null;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'nodeTypeStep',
      label: t('Node details'),
      inputs: <NodeTypeStep />,
      validate: (wizardData: Partial<WizardFormValues>) => {
        validateJobTemplateRequirements(t, wizardData);
      },
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        const { launch_config, resource, node_type } = wizardData;
        if (!launch_config) {
          return true;
        }

        if (
          (node_type === RESOURCE_TYPE.workflow_job || node_type === RESOURCE_TYPE.job) &&
          resource
        ) {
          return shouldHideOtherStep(launch_config);
        }
        // nodePromptsStep is always present in initialValues (it carries original
        // node resources for save cleanup). Only show the step if the original
        // template actually had prompts, which is indicated by launch_config being
        // stored in the initial prompt values.
        if (initialValues.nodePromptsStep?.prompt?.launch_config) {
          return false;
        }
        return true;
      },
      validate: (wizardData: Partial<WizardFormValues>) => {
        // Prefer the live wizard data's requiredCredentialTypes so that validation reflects
        // the currently selected template, not the template that was loaded when the wizard
        // was first opened (which is stale if the user switched templates mid-edit).
        const requiredCredentialTypes =
          wizardData.prompt?.requiredCredentialTypes ||
          initialValues?.nodePromptsStep?.prompt?.requiredCredentialTypes ||
          [];
        validateRequiredCredentialTypes(t, wizardData, requiredCredentialTypes);
      },
    },
    {
      id: 'survey',
      label: t('Survey'),
      inputs: <SurveyStep singleColumn />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        const { launch_config, node_type } = wizardData;
        if (Object.keys(wizardData).length === 0) {
          return true;
        }
        if (node_type && ![RESOURCE_TYPE.workflow_job, RESOURCE_TYPE.job].includes(node_type)) {
          return true;
        }
        return !launch_config?.survey_enabled;
      },
    },
    { id: 'review', label: t('Review'), element: <NodeReviewStep /> },
  ];

  const handleSubmit = async (formValues: WizardFormValues) => {
    const nodeData = node.getData() as { resource: WorkflowNode };
    const nodeOriginalResources = initialValues?.nodePromptsStep?.prompt?.original;
    const originalTemplateId = nodeData.resource.summary_fields?.unified_job_template?.id;

    const {
      approval_name,
      approval_description,
      node_type,
      resource,
      approval_timeout,
      node_alias,
      node_convergence,
      node_days_to_keep,
      launch_config,
      prompt,
      survey,
    } = formValues;

    const { effectivePrompt } = buildEffectivePrompt({
      originalTemplateId,
      newResourceId: resource?.id ? Number(resource.id) : undefined,
      prompt,
      launchConfig: launch_config ?? undefined,
      nodeOriginalResources,
      resourceOrganization:
        resource && 'organization' in resource ? (resource.organization ?? null) : undefined,
    });

    const nodeName = getValueBasedOnJobType(node_type, resource?.name || '', approval_name);
    const nodeIdentifier = replaceIdentifier(nodeData.resource.identifier, node_alias);
    const nodeToEdit: GraphNodeData = {
      ...nodeData,
      resource: {
        ...nodeData.resource,
        all_parents_must_converge: node_convergence === 'all',
        identifier: nodeIdentifier,
        extra_data: {
          days: node_days_to_keep,
        },
        summary_fields: {
          ...nodeData.resource.summary_fields,
          unified_job_template: {
            id: Number(resource?.id || -1),
            name: nodeName,
            description: getValueBasedOnJobType(
              node_type,
              resource?.description || '',
              approval_description
            ),
            unified_job_type: node_type,
            timeout: approval_timeout,
          },
        },
      },
      launch_data: effectivePrompt,
      survey_data: survey,
    };

    if (node_type !== RESOURCE_TYPE.workflow_approval) {
      delete nodeToEdit.resource.summary_fields?.unified_job_template?.timeout;
    }
    if (!hasDaysToKeep(resource)) {
      nodeToEdit.resource.extra_data = {};
    }

    // Fix race condition: without action(), node updates are async and non-atomic.
    // The save operation could read stale node data if it executes mid-update, losing changes.
    action(() => {
      node.setLabel(getNodeLabel(nodeName, node_alias));
      node.setData(nodeToEdit);
      node.setState({ modified: true });
      controller.setState({ ...controller.getState(), modified: true });
    })();

    // Layout must happen after action() commits data to avoid operating on stale state
    controller.getGraph().layout();
    closeSidebar();

    await Promise.resolve();
  };

  return (
    <PageWizard<WizardFormValues>
      isVertical
      singleColumn
      steps={steps}
      onCancel={closeSidebar}
      onSubmit={handleSubmit}
      stepDefaults={initialValues}
      errorAdapter={awxErrorAdapter}
      title={t('Edit step')}
    />
  );
}
