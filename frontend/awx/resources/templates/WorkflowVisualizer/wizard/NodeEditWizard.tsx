import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisualizationController } from '@patternfly/react-topology';
import { PageWizard, PageWizardStep, usePageAlertToaster } from '../../../../../../framework';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import type { GraphNode, GraphNodeData, PromptFormValues, WizardFormValues } from '../types';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { NodeTypeStep } from './NodeTypeStep';
import { NodePromptsStep } from './NodePromptsStep';
import { NodeReviewStep } from './NodeReviewStep';
import { useCloseSidebar, useGetInitialValues } from '../hooks';
import {
  getNodeLabel,
  getValueBasedOnJobType,
  hasDaysToKeep,
  replaceIdentifier,
  shouldHideOtherStep,
} from './helpers';
import { RESOURCE_TYPE } from '../constants';

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
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        const { launch_config, node_resource, node_type } = wizardData;
        const unmodifiedWizard = Object.keys(wizardData).length === 0;
        if ('nodePromptsStep' in initialValues && unmodifiedWizard) {
          return false;
        }

        if (
          (node_type === RESOURCE_TYPE.workflow_job || node_type === RESOURCE_TYPE.job) &&
          node_resource &&
          launch_config
        ) {
          return shouldHideOtherStep(launch_config);
        }
        return true;
      },
    },
    { id: 'review', label: t('Review'), element: <NodeReviewStep /> },
  ];

  const handleSubmit = async (formValues: WizardFormValues) => {
    const nodeData = node.getData() as { resource: WorkflowNode };
    const nodeOriginalResources = initialValues?.nodePromptsStep?.prompt?.original;

    const {
      approval_name,
      approval_description,
      node_type,
      node_resource,
      approval_timeout,
      node_alias,
      node_convergence,
      node_days_to_keep,
      launch_config,
      prompt,
    } = formValues;
    const promptValues = prompt;

    if (promptValues) {
      if (node_resource && 'organization' in node_resource) {
        promptValues.organization = node_resource.organization ?? null;
      }
      if (launch_config) {
        promptValues.original = {
          launch_config,
        };
      }
      if (nodeOriginalResources) {
        promptValues.original = {
          ...promptValues.original,
          ...nodeOriginalResources,
        };
      }
    }

    const nodeName = getValueBasedOnJobType(node_type, node_resource?.name || '', approval_name);
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
            id: Number(node_resource?.id || 0),
            name: nodeName,
            description: getValueBasedOnJobType(
              node_type,
              node_resource?.description || '',
              approval_description
            ),
            unified_job_type: node_type,
            timeout: approval_timeout,
          },
        },
      },
      launch_data: promptValues,
    };

    if (node_type !== RESOURCE_TYPE.workflow_approval) {
      delete nodeToEdit.resource.summary_fields.unified_job_template.timeout;
    }
    if (!hasDaysToKeep(node_resource)) {
      nodeToEdit.resource.extra_data = {};
    }

    node.setLabel(getNodeLabel(nodeName, node_alias));
    node.setData(nodeToEdit);
    node.setState({ modified: true });

    controller.setState({ ...controller.getState(), modified: true });
    closeSidebar();
    controller.getGraph().layout();

    await Promise.resolve();
  };

  return (
    <PageWizard<WizardFormValues>
      isVertical
      singleColumn
      steps={steps}
      onCancel={closeSidebar}
      onSubmit={handleSubmit}
      defaultValue={initialValues}
      errorAdapter={awxErrorAdapter}
      title={t('Edit step')}
    />
  );
}
