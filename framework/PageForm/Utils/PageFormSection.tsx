import { FormSection, GridItem } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { PageFormGrid } from '../PageForm';

export function PageFormSection(props: {
  title?: string;
  children: ReactNode;
  singleColumn?: boolean;
}) {
  if (!props.title) {
    return (
      <GridItem span={12}>
        <PageFormGrid singleColumn={props.singleColumn}>{props.children}</PageFormGrid>
      </GridItem>
    );
  }
  return (
    <FormSection title={props.title} style={{ marginTop: 16 }} className="pf-m-12-col">
      <PageFormGrid singleColumn={props.singleColumn}>{props.children}</PageFormGrid>
    </FormSection>
  );
}
