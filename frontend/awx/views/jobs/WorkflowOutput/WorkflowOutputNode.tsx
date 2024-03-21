import { ElementType, LegacyRef } from 'react';
import styled from 'styled-components';
import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import {
  DefaultNode,
  ElementModel,
  Layer,
  TOP_LAYER,
  GraphElement,
  NodeStatus,
  WithSelectionProps,
  observer,
  useHover,
} from '@patternfly/react-topology';
import { usePageNavigate } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useStatusDecorator } from './hooks/useStatusDecorator';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

const StyledNode = styled(DefaultNode)`
  &.pf-m-hover {
    cursor: pointer;
  }
  &.unexecuted-job {
    &:hover {
      cursor: default;
    }
    .pf-topology__node__background {
      fill: var(--pf-v5-chart-color-black-300);
      stroke: var(--pf-v5-global--Color--200);
    }
  }
`;

export const jobPaths: { [key: string]: string } = {
  project_update: 'project',
  inventory_update: 'inventory',
  job: 'playbook',
  ad_hoc_command: 'command',
  system_job: 'management',
  workflow_job: 'workflow',
};

const NodeIcon: { [key: string]: ElementType<SVGIconProps> } = {
  inventory_update: ProcessAutomationIcon,
  job: ClipboardCheckIcon,
  project_update: SyncAltIcon,
  system_job: CogIcon,
  workflow_approval: ClockIcon,
  workflow_job: ShareAltIcon,
  deleted_resource: TrashIcon,
};

interface WorkflowOutputNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      badge?: string;
      badgeColor?: string;
      badgeTextColor?: string;
      badgeBorderColor?: string;

      secondaryLabel?: string;
      resource: WorkflowNode;
    }
  >;
}

export const WorkflowOutputNode = observer(({ element, selected }: WorkflowOutputNodeProps) => {
  const [hover, hoverRef] = useHover();
  const pageNavigate = usePageNavigate();
  const statusDecorator = useStatusDecorator();
  const status = element.getController().getNodeById(element.getId())?.getNodeStatus();
  const data = element.getData();
  const { job, unified_job_template } = data?.resource?.summary_fields || {};
  const { unified_job_type: templateType } = unified_job_template || {};
  const Icon = NodeIcon[templateType ?? 'deleted_resource'];

  function handleSelect() {
    if (!job) return;

    const routeParams =
      job.type === 'workflow_approval'
        ? { params: { id: job.id } }
        : { params: { job_type: jobPaths[job.type], id: job.id } };

    pageNavigate(
      job.type === 'workflow_approval' ? AwxRoute.WorkflowApprovalDetails : AwxRoute.JobOutput,
      routeParams
    );
  }

  return (
    <Layer id={hover ? TOP_LAYER : undefined}>
      <g ref={hoverRef as LegacyRef<SVGGElement>}>
        <StyledNode
          showLabel
          element={element}
          labelClassName={`${element.getId()}-node-label`}
          onSelect={handleSelect}
          secondaryLabel={data?.secondaryLabel}
          selected={job?.type ? selected : false}
          truncateLength={20}
          badge={data?.badge}
          badgeColor={data?.badgeColor}
          badgeTextColor={data?.badgeTextColor}
          badgeBorderColor={data?.badgeBorderColor}
          className={status === NodeStatus.default && !job ? 'unexecuted-job' : ''}
        >
          <g transform={`translate(13, 13)`}>
            <Icon style={{ color: '#393F44' }} width={25} height={25} />
          </g>
          {statusDecorator(element)}
        </StyledNode>
      </g>
    </Layer>
  );
});
