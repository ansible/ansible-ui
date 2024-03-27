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
  WithContextMenuProps,
  WithCreateConnectorProps,
  WithSelectionProps,
  isNode,
  observer,
} from '@patternfly/react-topology';

import { useViewOptions } from '../ViewOptionsProvider';
import { START_NODE_ID } from '../constants';
import type { CustomNodeProps } from '../types';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

const NodeIcon: { [key: string]: ElementType<SVGIconProps> } = {
  inventory_update: ProcessAutomationIcon,
  job: ClipboardCheckIcon,
  project_update: SyncAltIcon,
  system_job: CogIcon,
  workflow_approval: ClockIcon,
  workflow_job: ShareAltIcon,
  deleted_resource: TrashIcon,
};

export const CustomNode: FC<
  CustomNodeProps & WithContextMenuProps & WithSelectionProps & WithCreateConnectorProps
> = observer(({ element, onSelect, ...rest }) => {
  const { setSidebarMode } = useViewOptions();
  const jobType =
    element.getData()?.resource?.summary_fields?.unified_job_template?.unified_job_type;

  const id = element.getId();
  const data = element.getData();
  if (!data && isNode(element)) return null;

  const Icon = NodeIcon[jobType ?? 'deleted_resource'];

  return id !== START_NODE_ID ? (
    <DefaultNode
      showLabel
      element={element}
      labelClassName={`${id}-node-label`}
      onSelect={(e) => {
        if (!jobType) return;
        setSidebarMode('view');
        onSelect && onSelect(e);
      }}
      truncateLength={20}
      {...rest}
      badge={data?.badge}
      badgeColor={data?.badgeColor}
      badgeTextColor={data?.badgeTextColor}
      badgeBorderColor={data?.badgeBorderColor}
    >
      <g transform={`translate(13, 13)`}>
        <Icon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  ) : (
    <DefaultNode
      {...rest}
      element={element}
      labelClassName={`${id}-node-label`}
      dragging={false}
      truncateLength={20}
      badge={data?.badge}
      badgeColor={data?.badgeColor}
      badgeTextColor={data?.badgeTextColor}
      badgeBorderColor={data?.badgeBorderColor}
    >
      <g transform={`translate(13, 13)`}>
        <HomeIcon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
});
