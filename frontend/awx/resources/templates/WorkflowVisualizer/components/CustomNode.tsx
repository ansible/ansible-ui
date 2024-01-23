import { ElementType, FC } from 'react';
import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import {
  DefaultNode,
  LabelPosition,
  WithContextMenuProps,
  WithCreateConnectorProps,
  WithDragNodeProps,
  WithSelectionProps,
  observer,
} from '@patternfly/react-topology';
import type { CustomNodeProps } from '../types';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import type { UnifiedJobType } from '../../../../interfaces/WorkflowNode';

const NodeIcon: Record<UnifiedJobType, ElementType<SVGIconProps>> = {
  inventory_update: ProcessAutomationIcon,
  job: ClipboardCheckIcon,
  project_update: SyncAltIcon,
  system_job: CogIcon,
  workflow_approval: ClockIcon,
  workflow_job: ShareAltIcon,
};

export const CustomNode: FC<
  CustomNodeProps &
    WithContextMenuProps &
    WithSelectionProps &
    WithDragNodeProps &
    WithCreateConnectorProps
> = observer((props) => {
  const { element, contextMenuOpen, onContextMenu, onSelect, selected, ...rest } = props;
  const data = element.getData();
  const id = element.getId();
  const jobType = data && data.resource.summary_fields.unified_job_template?.unified_job_type;

  if (!data || !jobType) return null;

  const Icon = NodeIcon[jobType];

  return (
    <DefaultNode
      element={element}
      labelClassName={`${id}-node-label`}
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
});
