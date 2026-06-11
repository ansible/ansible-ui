import { Bullseye, Spinner } from '@patternfly/react-core';

export function LoadingState() {
  return (
    <Bullseye>
      <Spinner />
    </Bullseye>
  );
}
