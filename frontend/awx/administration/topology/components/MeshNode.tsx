import { pfDisabled } from '@ansible/ansible-ui-framework';
import {
  BuilderImageIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  DataProcessorIcon,
  DatabaseIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import {
  DEFAULT_DECORATOR_RADIUS,
  Decorator,
  DefaultNode,
  TopologyQuadrant,
  WithSelectionProps,
  getDefaultShapeDecoratorCenter,
} from '@patternfly/react-topology';
import { ReactElement, useMemo } from 'react';
import {
  topologyDecoratorStatusColorStyle,
  wrapTopologyDecoratorStatusIcon,
} from '../../../common/topologyDecoratorStatus';
import { CustomNodeProps } from '../types';

function getStatusIcon(nodeType: string): ReactElement {
  switch (nodeType) {
    case 'ready':
      return wrapTopologyDecoratorStatusIcon(<CheckCircleIcon className="pf-m-success" />);
    case 'installed':
      return wrapTopologyDecoratorStatusIcon(<ClockIcon className="pf-m-info" />);
    case 'provisioning':
      return wrapTopologyDecoratorStatusIcon(
        <g style={topologyDecoratorStatusColorStyle(pfDisabled)}>
          <PlusCircleIcon />
        </g>
      );
    case 'deprovisioning':
      return wrapTopologyDecoratorStatusIcon(
        <g style={topologyDecoratorStatusColorStyle(pfDisabled)}>
          <MinusCircleIcon />
        </g>
      );
    case 'unavailable':
    case 'deprovision-fail':
    case 'provision-fail':
      return wrapTopologyDecoratorStatusIcon(<ExclamationCircleIcon className="pf-m-danger" />);
    default:
      return wrapTopologyDecoratorStatusIcon(
        <g style={topologyDecoratorStatusColorStyle(pfDisabled)}>
          <QuestionCircleIcon />
        </g>
      );
  }
}

export function getNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'hybrid':
      return BuilderImageIcon;
    case 'execution':
      return CubeIcon;
    case 'control':
      return DatabaseIcon;
    case 'hop':
      return DataProcessorIcon;
    default:
      return DatabaseIcon;
  }
}

export const MeshNode: React.FC<CustomNodeProps & WithSelectionProps> = ({
  element,
  onSelect,
  selected,
}: CustomNodeProps) => {
  const data = element.getData();
  const Icon = data && getNodeIcon(data.nodeType);

  const statusDecorator = useMemo(() => {
    const icon = data && getStatusIcon(data.nodeStatus);
    if (!icon) {
      return null;
    }
    const { x, y } = getDefaultShapeDecoratorCenter(TopologyQuadrant.upperLeft, element);

    const decorator = (
      <Decorator
        x={x}
        y={y}
        radius={DEFAULT_DECORATOR_RADIUS}
        showBackground
        onClick={onSelect}
        icon={icon}
        ariaLabel={data?.nodeStatus}
      />
    );

    return decorator;
  }, [data, element, onSelect]);

  return (
    <DefaultNode
      element={element}
      onSelect={onSelect}
      selected={selected}
      onStatusDecoratorClick={onSelect}
      truncateLength={20}
    >
      <g transform={`translate(13, 13)`}>
        {Icon && <Icon style={{ color: '#393F44' }} width={25} height={25} />}
      </g>
      {statusDecorator}
    </DefaultNode>
  );
};
