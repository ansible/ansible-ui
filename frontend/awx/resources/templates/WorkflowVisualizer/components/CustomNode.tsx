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
import type { CustomNodeProps, UnifiedJobType } from '../types';
import type { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { START_NODE_ID } from '../constants';
import { useStatusDecorator } from '../hooks/useStatusDecorator';

const NodeIcon: Record<UnifiedJobType, ElementType<SVGIconProps>> = {
  inventory_update: ProcessAutomationIcon,
  job: ClipboardCheckIcon,
  project_update: SyncAltIcon,
  system_job: CogIcon,
  workflow_approval: ClockIcon,
  workflow_job: ShareAltIcon,
};

export const CustomNode: FC<
  CustomNodeProps & WithContextMenuProps & WithSelectionProps & WithCreateConnectorProps
> = observer((props) => {
  const { element, onSelect, ...rest } = props;
  const { setSidebarMode } = useViewOptions();
  const statusDecorator = useStatusDecorator();
  const data = element.getData();
  const id = element.getId();
  const jobType = data && data.resource?.summary_fields?.unified_job_template?.unified_job_type;
  if ((!data && id !== START_NODE_ID) || !isNode(element)) return null;
  const Icon = jobType ? NodeIcon[jobType] : TrashIcon;
  return id !== START_NODE_ID ? (
    <DefaultNode
      element={element}
      showLabel
      secondaryLabel={data?.secondaryLabel}
      labelClassName={`${id}-node-label`}
      onSelect={(e) => {
        if (!jobType) return;
        setSidebarMode('view');
        onSelect && onSelect(e);
      }}
      truncateLength={20}
      badge={data?.badge}
      badgeColor={data?.badgeColor}
      badgeTextColor={data?.badgeTextColor}
      badgeBorderColor={data?.badgeBorderColor}
      {...rest}
    >
      <g transform={`translate(13, 13)`}>
        <Icon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
      {statusDecorator(element)}
    </DefaultNode>
  ) : (
    <DefaultNode
      {...rest}
      element={element}
      labelClassName={`${id}-node-label`}
      dragging={false}
      truncateLength={20}
    >
      <g transform={`translate(13, 13)`}>
        <HomeIcon style={{ color: '#393F44' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
});
