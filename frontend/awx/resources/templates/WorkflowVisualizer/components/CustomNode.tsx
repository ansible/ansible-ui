import { ComponentClass, FunctionComponent } from 'react';
import { DefaultNode } from '@patternfly/react-topology';
import { CustomNodeProps } from '../types';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import type { UnifiedJobType } from '../../../../interfaces/WorkflowNode';

const NodeIcon: Record<UnifiedJobType, ComponentClass<SVGIconProps>> = {
  job: ClipboardCheckIcon,
  workflow_job: ShareAltIcon,
  project_update: SyncAltIcon,
  workflow_approval: ClockIcon,
  inventory_update: ProcessAutomationIcon,
  system_job: CogIcon,
};

export const CustomNode: FunctionComponent<CustomNodeProps> = ({ element }: CustomNodeProps) => {
  const data = element.getData();

  if (!data) return;

  const jobType = data.jobType;
  const Icon = NodeIcon[jobType];

  return (
    <DefaultNode element={element}>
      <g transform={`translate(13, 13)`}>
        {Icon && <Icon style={{ color: '#393F44' }} width={25} height={25} />}
      </g>
    </DefaultNode>
  );
};
