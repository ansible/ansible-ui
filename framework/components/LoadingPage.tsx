import { Divider, PageSection, Skeleton } from '@patternfly/react-core';
import { Fragment } from 'react';
import { LoadingState } from './LoadingState';

export function LoadingPage(props: { breadcrumbs?: boolean; tabs?: boolean }) {
  return (
    <Fragment>
      {props.tabs && (
        <PageSection hasBodyWrapper={false} style={{ paddingTop: 8, paddingBottom: 8 }}>
          <Skeleton width="150px" />
        </PageSection>
      )}
      <Divider />
      <LoadingState />
    </Fragment>
  );
}
