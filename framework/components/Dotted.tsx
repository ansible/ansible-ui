import { ReactNode } from 'react';
import styled from 'styled-components';

const Span = styled.span`
  text-decoration: underline dotted;
`;

export function Dotted(props: { children: ReactNode }) {
  return <Span>{props.children}</Span>;
}
