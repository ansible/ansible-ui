import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const ChartContainerDiv = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  align-self: stretch';
  justify-self: stretch;
  position: relative;
  `;
const PropsDiv = styled.div`
  position: absolute;
`;

export interface PageContainerSize {
  width: number;
  height: number;
}

export function PageChartContainer(props: { children: (size: PageContainerSize) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<PageContainerSize>({
    width: ref.current?.clientWidth ?? 0,
    height: ref.current?.clientWidth ?? 0,
  });
  const updateSize = useCallback(
    () =>
      setContainerSize((containerSize) => {
        const newContainerSize = {
          width: ref.current?.clientWidth ?? 0,
          height: ref.current?.clientHeight ?? 0,
        };
        if (
          newContainerSize.width !== containerSize.width ||
          newContainerSize.height !== containerSize.height
        ) {
          return newContainerSize;
        }
        return containerSize;
      }),
    []
  );
  useEffect(() => updateSize(), [ref, updateSize]);
  useResizeObserver(ref, () => updateSize());
  return (
    <ChartContainerDiv ref={ref}>
      <PropsDiv>{props.children(containerSize)}</PropsDiv>
    </ChartContainerDiv>
  );
}
