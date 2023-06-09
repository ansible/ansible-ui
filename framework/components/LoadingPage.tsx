import { Divider, PageSection, Skeleton } from '@patternfly/react-core';
import { Fragment } from 'react';
import { PageHeader } from '../PageHeader';
import { LoadingState } from './LoadingState';

export function LoadingPage(props: { breadcrumbs?: boolean; tabs?: boolean }) {
  return (
    <Fragment>
      <PageHeader
        breadcrumbs={
          props.breadcrumbs
            ? [{ label: (<Skeleton width="150px" />) as unknown as string }]
            : undefined
        }
        title={(<Skeleton width="200px" />) as unknown as string}
      />
      {props.tabs && (
        <PageSection variant="light" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <Skeleton width="150px" />
        </PageSection>
      )}
      <Divider />
      <LoadingState />
    </Fragment>
  );
}
