import { ReactNode } from 'react';
import './Collapse.css';

export function Collapse(props: { open: boolean; children: ReactNode }) {
  let className = 'collapsed';
  if (props.open) className += ' expanded';
  return <div className={className}>{props.children}</div>;
}
