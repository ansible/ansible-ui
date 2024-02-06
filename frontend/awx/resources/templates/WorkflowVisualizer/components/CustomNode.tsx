import { ElementType, FC } from 'react';
import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  HomeIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import {
  DefaultNode,
  LabelPosition,
  NodeStatus,
  WithContextMenuProps,
  WithCreateConnectorProps,
  WithDragNodeProps,
  WithSelectionProps,
  observer,
} from '@patternfly/react-topology';
import { useViewOptions } from '../ViewOptionsProvider';
import type { CustomNodeProps } from '../types';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import type { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import { START_NODE_ID } from '../constants';

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
  const { setSidebarMode } = useViewOptions();

  const { element, contextMenuOpen, onContextMenu, onSelect, selected, ...rest } = props;
  const data = element.getData();
  const isInvalidLinkTarget = element.getState<{ isInvalidLinkTarget: boolean }>()
    .isInvalidLinkTarget;

  const id = element.getId();
  const jobType = data && data.resource.summary_fields?.unified_job_template?.unified_job_type;

  if (!data && id !== START_NODE_ID) return null;
  const Icon = jobType ? NodeIcon[jobType] : TrashIcon;
  return id !== START_NODE_ID ? (
    <DefaultNode
      nodeStatus={isInvalidLinkTarget ? NodeStatus.danger : NodeStatus.default}
      showStatusDecorator
      canDrop={!isInvalidLinkTarget}
      element={element}
      labelClassName={`${id}-node-label`}
      contextMenuOpen={contextMenuOpen}
      labelPosition={LabelPosition.right}
      onContextMenu={onContextMenu}
      onSelect={(e) => {
        if (!jobType) return;
        setSidebarMode('view');
        onSelect && onSelect(e);
      }}
      selected={selected}
      truncateLength={20}
      {...rest}
    >
      <g transform={`translate(13, 13)`}>
        <Icon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  ) : (
    <DefaultNode
      element={element}
      labelClassName={`${id}-node-label`}
      contextMenuOpen={contextMenuOpen}
      labelPosition={LabelPosition.right}
      onContextMenu={onContextMenu}
      dragging={false}
      selected={false}
      truncateLength={20}
    >
      <g transform={`translate(13, 13)`}>
        <HomeIcon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
});
