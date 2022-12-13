import React from 'react';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';

export function LoadingState() {
  return (
      <PageSection isFilled variant="light">
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
  );
}
