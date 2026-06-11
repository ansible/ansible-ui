import { ReactNode } from 'react';
import { getPatternflyColor } from './pfcolors';

export function Unavailable(props: { children: ReactNode }) {
  return (
    <span
      style={{
        color: getPatternflyColor('red'),
      }}
    >
      {props.children}
    </span>
  );
}
