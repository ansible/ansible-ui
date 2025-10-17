import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Help } from '../components/Help';
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
  const { label, children, helpText, isEmpty, fullWidth } = props;
  if (children === null || typeof children === 'undefined' || children === '') {
    return <></>;
  }
  if (isEmpty) {
    return <></>;
  }
  return (
    <DescriptionListGroupStyled $fullWidth={fullWidth}>
      {label && (
        <DescriptionListTerm data-cy={`label-${id}`} data-testid={`label-${id}`}>
          {label}
          {helpText ? <Help title={label} help={helpText} /> : null}
        </DescriptionListTerm>
      )}
      <DescriptionListDescriptionStyled id={id} data-cy={id} data-testid={id}>
        {children}
      </DescriptionListDescriptionStyled>
    </DescriptionListGroupStyled>
  );
}

const DescriptionListGroupStyled = styled(DescriptionListGroup)<{ $fullWidth?: boolean }>`
  grid-column: ${(props: { $fullWidth?: boolean }) => (props.$fullWidth ? '1 / -1' : 'span 1')};
`;

const DescriptionListDescriptionStyled = styled(DescriptionListDescription)`
  opacity: 0.8;
`;
