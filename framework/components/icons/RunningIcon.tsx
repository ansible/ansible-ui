import { SyncAltIcon } from '@patternfly/react-icons';
import styled, { keyframes } from 'styled-components';

const Spin = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
`;

export const RunningIcon = styled(SyncAltIcon)`
  animation: ${Spin} 1.75s linear infinite;
`;

RunningIcon.displayName = 'RunningIcon';
