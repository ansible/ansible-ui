import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ReactNode } from 'react';

export function PageDetail(props: { label?: string; children?: ReactNode; isEmpty?: boolean }) {
  if (props.children === null || typeof props.children === 'undefined' || props.children === '') {
    return <></>;
  }
  if (props.isEmpty) {
    return <></>;
  }

  return (
    <DescriptionListGroup>
      {props.label && <DescriptionListTerm>{props.label}</DescriptionListTerm>}
      <DescriptionListDescription id={props.label?.toLowerCase().split(' ').join('-')}>
        {props.children}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}
