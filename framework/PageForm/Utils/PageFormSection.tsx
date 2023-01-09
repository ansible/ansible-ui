import { FormSection } from '@patternfly/react-core';
import { ReactNode } from 'react';

export function PageFormSection(props: { title: string; children: ReactNode }) {
  return (
    <FormSection title={props.title} style={{ marginTop: 16 }}>
      {props.children}
    </FormSection>
  );
}
