import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import {
  DefaultNode,
  LabelPosition,
  WithContextMenuProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import { ElementType, FC } from 'react';
import type { UnifiedJobType } from '../../../interfaces/WorkflowNode';
import type { CustomNodeProps } from '../types';

const NodeIcon: Record<UnifiedJobType, ElementType<SVGIconProps>> = {
  inventory_update: ProcessAutomationIcon,
  job: ClipboardCheckIcon,
  project_update: SyncAltIcon,
  system_job: CogIcon,
  workflow_approval: ClockIcon,
  workflow_job: ShareAltIcon,
};

export const CustomNode: FC<
  CustomNodeProps & WithContextMenuProps & WithSelectionProps & WithDragNodeProps
> = ({ element, contextMenuOpen, onContextMenu, onSelect, selected, ...rest }) => {
  const data = element.getData();

  if (!data || !data.jobType) return null;

  const Icon = NodeIcon[data.jobType];

  return (
    <DefaultNode
      element={element}
      labelClassName={`${data.id}-node-label`}
      contextMenuOpen={contextMenuOpen}
      labelPosition={LabelPosition.right}
      onContextMenu={onContextMenu}
      onSelect={onSelect}
      selected={selected}
      showStatusDecorator
      truncateLength={20}
      {...rest}
    >
      <g transform={`translate(13, 13)`}>
        <Icon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
};
