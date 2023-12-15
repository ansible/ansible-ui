import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useVisualizationController, NodeShape, isNode } from '@patternfly/react-topology';
import { awxErrorAdapter } from '../../../../adapters/awxErrorAdapter';
import { stringIsUUID } from '../../../../common/util/strings';
import { useCloseSidebar } from '../hooks';
import { NodeDetailsStep } from './NodeDetailsStep';
import type { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';
import type { SummaryFieldUnifiedJobTemplate } from '../../../../interfaces/summary-fields/summary-fields';

export interface WorkflowNodeWizardData {
  node_type: UnifiedJobType;
  node_resource: SummaryFieldUnifiedJobTemplate & { timeout: number };
  alias: string;
  convergence: 'any' | 'all';
  description: string;
  name: string;
  timeout_minutes?: number;
  timeout_seconds?: number;
  days_to_keep?: number;
  showDaysToKeep?: boolean;
}

const replaceIdentifier = (node: WorkflowNode, alias: string) => {
  if (stringIsUUID(node.identifier) && typeof alias === 'string' && alias !== '') {
    return true;
  }
  if (!stringIsUUID(node.identifier) && node.identifier !== alias) {
    return true;
  }
  return false;
};

export function NodeWizard({ mode }: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const handleClose = useCloseSidebar();
  const controller = useVisualizationController();
  let resource: WorkflowNode | undefined;

  if (mode === 'edit') {
    const { selectedIds } = controller.getState<{ selectedIds: string[] }>();
    const data = controller.getNodeById(selectedIds[0])?.getData() as {
      resource: WorkflowNode;
    };
    resource = data.resource;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'details-step',
      label: t('Node details'),
      inputs: <NodeDetailsStep />,
    },
    { id: 'review', label: t('Review'), element: <h1>{t('Review')}</h1> },
  ];

  const defaultUnifiedJobTemplate = resource?.summary_fields?.unified_job_template;
  const defaultTimeout = defaultUnifiedJobTemplate?.timeout || 0;
  const defaultStepValues = {
    'details-step': {
      node_type: defaultUnifiedJobTemplate?.unified_job_type || 'job',
      node_resource: defaultUnifiedJobTemplate || undefined,
      convergence: resource?.all_parents_must_converge ? 'all' : 'any',
      alias: !stringIsUUID(resource?.identifier || '') ? resource?.identifier : '',
      name: defaultUnifiedJobTemplate?.name || '',
      description: defaultUnifiedJobTemplate?.description || '',
      days_to_keep: resource?.extra_data?.days ?? 30,
      timeout_minutes: Math.floor(defaultTimeout / 60),
      timeout_seconds: defaultTimeout - Math.floor(defaultTimeout / 60) * 60,
    },
  };

  const handleSubmit = (data: WorkflowNodeWizardData) => {
    if (mode === 'add') {
      const nodes = controller.getElements().filter(isNode);

      const node = {
        id: `${nodes.length + 1}-unsavedNode`,
        type: 'node',
        label: data.alias || data.node_resource.name,
        width: 50,
        height: 50,
        shape: NodeShape.circle,
        data: {
          resource: {
            summary_fields: {
              unified_job_template: {
                unified_job_type: data.node_type,
                name: data.node_resource.name,
                description: data.node_resource.description,
              },
            },
          },
        },
      };

      const model = controller.toModel();

      model?.nodes?.push(node);
      model.graph = {
        id: 'workflow-visualizer-graph',
        layout: 'Dagre',
        type: 'graph',
        visible: true,
      };

      controller.fromModel(model, true);
    } else if (mode === 'edit' && resource) {
      const nodeToEdit = controller.getNodeById(resource.id.toString());
      const nodeData = nodeToEdit?.getData() as { id: string; resource: WorkflowNode };
      const resourceIdentifier = replaceIdentifier(nodeData.resource, data.alias)
        ? data.alias
        : nodeData.resource.identifier;

      const updatedData = {
        ...nodeData,
        resource: {
          ...nodeData.resource,
          unified_job_template: data.node_resource?.id,
          all_parents_must_converge: data.convergence,
          identifier: resourceIdentifier,
          extra_data: data.showDaysToKeep ? { days: data.days_to_keep } : {},
          summary_fields: {
            unified_job_template: {
              id: data.node_resource?.id,
              name: data.node_resource?.name,
              description: data.node_resource?.description,
              unified_job_type: data.node_type,
            },
          },
        },
      };

      nodeToEdit?.setData(updatedData);
    }
    handleClose();
    return Promise.resolve();
  };

  return (
    <PageWizard<WorkflowNodeWizardData>
      isVertical
      singleColumn
      steps={steps}
      onCancel={handleClose}
      onSubmit={handleSubmit}
      defaultValue={defaultStepValues}
      errorAdapter={awxErrorAdapter}
    />
  );
}
