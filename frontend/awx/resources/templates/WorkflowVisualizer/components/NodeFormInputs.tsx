import { useTranslation } from 'react-i18next';
import { NodeShape, isNode, useVisualizationController } from '@patternfly/react-topology';
import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { NodeTypeStep } from './NodeTypeStep';
import { useCloseSidebar } from '../hooks';
import { GRAPH_ID, NODE_DIAMETER } from '../constants';
import type { GraphNode, NodeFields } from '../types';

export function NodeFormInputs(props: { node: GraphNode | undefined }) {
  const { t } = useTranslation();
  const closeSidebar = useCloseSidebar();
  const { node } = props;
  const nodeData = node?.getData()?.resource;

  const controller = useVisualizationController();

  const steps: PageWizardStep[] = [
    {
      id: 'node_type_step',
      label: t('Run type'),
      inputs: <NodeTypeStep />,
    },
    { id: 'review', label: t('Review'), element: <h1>{t('Review')}</h1> },
  ];

  const initialValues = {
    node_type_step: {
      parentNodes: [],
      node_type: nodeData?.summary_fields?.unified_job_template?.unified_job_type || 'job',
      node_resource: nodeData?.summary_fields?.unified_job_template || undefined,
      node_status_type: 'always',
      all_parents_must_converge: 'any',
      idenfifier: '',
    },
  };

  const handleSubmit = async (data: NodeFields) => {
    const model = controller.toModel();
    const nodes = controller.getElements().filter(isNode);
    const nodeId = `${nodes.length + 1}-unsavedNode`; // TODO: Switch based on wizard mode

    const node = {
      id: nodeId,
      type: 'node',
      label: data.identifier || data.node_resource.name,
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
      shape: NodeShape.circle,
      data: {
        resource: {
          summary_fields: {
            unified_job_template: {
              unified_job_type: data.node_type,
              name: data.node_resource.name,
              description: data.node_resource.description,
              id: data.node_resource.id,
            },
          },
        },
        all_parents_must_converge: data.all_parents_must_converge,
        identifier: data.identifier,
      },
    };
    model?.nodes?.push(node);
    model.graph = {
      id: GRAPH_ID,
      layout: 'Dagre',
      type: 'graph',
      visible: true,
    };

    controller.fromModel(model, false);
    controller.getNodeById(node.id)?.setState({ modified: true });
    closeSidebar();
    return Promise.resolve();
  };

  return (
    <PageWizard<NodeFields>
      isVertical
      singleColumn
      steps={steps}
      onCancel={closeSidebar}
      onSubmit={handleSubmit}
      defaultValue={initialValues}
      errorAdapter={awxErrorAdapter}
      title={t('Edit node')} // TODO: Switch based on wizard mode
    />
  );
}
