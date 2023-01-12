import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ReactNode } from 'react';
import { StandardPopover } from '../components/StandardPopover';

export function PageDetail(props: {
  label?: string;
  children?: ReactNode;
  helpText?: string;
  isEmpty?: boolean;
}) {
  const { label, children, helpText, isEmpty } = props;
  if (children === null || typeof children === 'undefined' || children === '') {
    return <></>;
  }
  if (isEmpty) {
    return <></>;
  }

  return (
    <DescriptionListGroup>
      {label && (
        <DescriptionListTerm>
          {label}
          {helpText ? <StandardPopover header={label} content={helpText} /> : null}
        </DescriptionListTerm>
      )}
      <DescriptionListDescription id={label?.toLowerCase().split(' ').join('-')}>
        {children}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}
