import useResizeObserver from '@react-hook/resize-observer';
import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import './Scrollable.css';

export function Scrollable(props: {
  children?: ReactNode;
  className?: string;
  borderTop?: boolean;
  borderBottom?: boolean;
  style?: CSSProperties;
}) {
  const divEl = useRef<HTMLDivElement>(null);
  const [topShadow, setTopShadow] = useState(false);
  const [bottomShadow, setBottomShadow] = useState(false);
  const update = useCallback(() => {
    if (!divEl.current) return;
    setTopShadow(divEl.current.scrollTop > 0);
    const scrollBottom =
      divEl.current.scrollHeight - divEl.current.scrollTop - divEl.current.clientHeight - 1;
    setBottomShadow(scrollBottom > 0.1);
  }, []);
  useEffect(() => update(), [update, props.children]);
  useResizeObserver(divEl, () => update());

  const innerClassNames = ['scrollable-inner'];
  if (props.borderTop) innerClassNames.push('border-top');
  if (props.borderBottom) innerClassNames.push('border-bottom');
  const innerClassName = innerClassNames.join(' ');

  return (
    <div className={`scrollable-outer ${props.className}`} style={props.style}>
      <div className={innerClassName} ref={divEl} onScroll={update}>
        {props.children}
      </div>
      {topShadow && <div className="scrollable-shadow-top" />}
      {bottomShadow && <div className={`scrollable-shadow-bottom`} />}
    </div>
  );
}
