import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ReactNode } from 'react';
import { StandardPopover } from '../components/StandardPopover';
import { useID } from '../hooks/useID';

export function PageDetail(props: {
  id?: string;
  label?: string;
  children?: ReactNode;
  helpText?: string | ReactNode;
  isEmpty?: boolean;
  fullWidth?: boolean;
}) {
  const id = useID(props);
  const { label, children, helpText, isEmpty } = props;
  if (children === null || typeof children === 'undefined' || children === '') {
    return <></>;
  }
  if (isEmpty) {
    return <></>;
  }
  return (
    <DescriptionListGroup style={{ gridColumn: props.fullWidth ? 'span 3' : undefined }}>
      {label && (
        <DescriptionListTerm>
          {label}
          {helpText ? <StandardPopover header={label} content={helpText} /> : null}
        </DescriptionListTerm>
      )}
      <DescriptionListDescription id={id} data-cy={id}>
        {children}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}
