import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { useTranslation } from 'react-i18next';
import { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { NodeTypeStep } from './NodeTypeStep';
import { awxErrorAdapter } from '../../../../adapters/awxErrorAdapter';

export interface NodeFields {
  parentNodes?: WorkflowNode[];
  node_type:
    | 'job'
    | 'workflow_job'
    | 'workflow_approval'
    | 'project_update'
    | 'inventory_update'
    | 'system_job';
  node_resource: {
    id: number;
    name: string;
    description: string;
    unified_job_type: UnifiedJobType;
    timeout_minute: number;
    timeout_seconds: number;
  };
  node_status_type: string;
  convergence: string;
  alias: string;
}

export function NodeFormInputs(props: {
  setSelectedNode: (node: WorkflowNode | undefined) => void;
  node: WorkflowNode | undefined;
}) {
  const { setSelectedNode } = props;
  const { t } = useTranslation();

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
      node_type: props.node?.summary_fields?.unified_job_template?.unified_job_type || 'job',
      node_resource: props.node?.summary_fields?.unified_job_template || undefined,
      node_status_type: 'always',
      convergence: 'any',
      alias: '',
    },
  };
  const handleSubmit = async (data: NodeFields) => {
    if (data) {
      return Promise.resolve();
    }
  };
  return (
    <PageWizard<NodeFields>
      isVertical
      singleColumn
      steps={steps}
      onCancel={() => setSelectedNode(undefined)}
      onSubmit={handleSubmit}
      defaultValue={initialValues}
      errorAdapter={awxErrorAdapter}
    />
  );
}
