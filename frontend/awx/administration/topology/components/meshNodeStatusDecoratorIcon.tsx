import { pfDisabled } from '@ansible/ansible-ui-framework';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { ReactElement } from 'react';
import {
  topologyDecoratorStatusColorStyle,
  wrapTopologyDecoratorStatusIcon,
} from '../../../common/topologyDecoratorStatus';

export function getMeshNodeStatusDecoratorIcon(nodeType: string): ReactElement {
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
