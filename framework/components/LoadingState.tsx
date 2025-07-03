import React from 'react';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';

export function LoadingState() {
  return (
    <PageSection hasBodyWrapper={false} isFilled>
      <Bullseye>
        <Spinner />
      </Bullseye>
    </PageSection>
  );
}
