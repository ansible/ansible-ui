import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import './Scrollable.css';

export function Scrollable(props: {
  children?: ReactNode;
  borderTop?: boolean;
  borderBottom?: boolean;
}) {
  const divEl = useRef<HTMLDivElement>(null);
  const [topShadow, setTopShadow] = useState(0);
  const [bottomShadow, setBottomShadow] = useState(0);
  const update = useCallback(() => {
    if (!divEl.current) return;
    setTopShadow(Math.min(1, divEl.current.scrollTop / 8));
    const scrollBottom =
      divEl.current.scrollHeight - divEl.current.scrollTop - divEl.current.clientHeight - 1;
    setBottomShadow(Math.max(0, Math.min(1, scrollBottom / 8)));
  }, []);
  useEffect(() => update(), [update, props.children]);
  useResizeObserver(divEl, () => update());

  const innerClassNames = ['scrollable-inner'];
  if (props.borderTop) innerClassNames.push('border-top');
  if (props.borderBottom) innerClassNames.push('border-bottom');
  const innerClassName = innerClassNames.join(' ');

  return (
    <div className="scrollable-outer">
      <div className={innerClassName} ref={divEl} onScroll={update}>
        {props.children}
      </div>
      {topShadow >= 0.1 && <div className="scrollable-shadow-top" />}
      {bottomShadow >= 0.1 && <div className={`scrollable-shadow-bottom`} />}
    </div>
  );
}
