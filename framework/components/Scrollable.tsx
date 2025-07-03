import useResizeObserver from '@react-hook/resize-observer';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

interface ScrollableState {
  stickyLeft: number;
  stickyRight: number;
  stickyTop: number;
  stickyBottom: number;
}

const ScrollableContext = createContext<
  [ScrollableState, React.Dispatch<React.SetStateAction<ScrollableState>>]
>([
  {
    stickyLeft: 0,
    stickyRight: 0,
    stickyTop: 0,
    stickyBottom: 0,
  },
  () => {},
]);

export function useScrollableState() {
  const context = useContext(ScrollableContext);
  if (!context) {
    throw new Error('useScrollableState must be used within a ScrollableProvider');
  }
  return context;
}

export function Scrollable(props: {
  className?: string;
  children?: ReactNode;
  onScroll?: (scroll: { left: number; right: number; top: number; bottom: number }) => void;
  marginTop?: number;
  marginBottom?: number;
  marginRight?: number;
  marginLeft?: number;
}) {
  const outerEl = useRef<HTMLDivElement>(null);
  const [outerSize, setOuterSize] = useState({ width: 0, height: 0 });
  const updateOuter = useCallback(() => {
    if (!outerEl.current) return;
    setOuterSize({ width: outerEl.current.clientWidth, height: outerEl.current.clientHeight });
  }, []);
  useResizeObserver(outerEl, updateOuter);

  const innerEl = useRef<HTMLDivElement>(null);
  const [innerSize, setInnerSize] = useState({ width: 0, height: 0 });
  const [topShadow, setTopShadow] = useState(false);
  const [bottomShadow, setBottomShadow] = useState(false);
  const [leftShadow, setLeftShadow] = useState(false);
  const [rightShadow, setRightShadow] = useState(false);
  const { onScroll } = props;
  const updateInner = useCallback(() => {
    if (!innerEl.current) return;
    setInnerSize({ width: innerEl.current.clientWidth, height: innerEl.current.clientHeight });
    setTopShadow(innerEl.current.scrollTop > 0);
    setLeftShadow(innerEl.current.scrollLeft > 0);
    setRightShadow(
      innerEl.current.scrollLeft < innerEl.current.scrollWidth - innerEl.current.clientWidth
    );
    const scrollBottom =
      innerEl.current.scrollHeight - innerEl.current.scrollTop - innerEl.current.clientHeight - 1;
    setBottomShadow(scrollBottom > 0.1);
    if (onScroll) {
      onScroll({
        left: innerEl.current.scrollLeft,
        right: innerEl.current.scrollLeft + innerEl.current.clientWidth,
        top: innerEl.current.scrollTop,
        bottom: innerEl.current.scrollTop + innerEl.current.clientHeight,
      });
    }
  }, [onScroll]);
  useEffect(() => updateInner(), [updateInner, props.children]);
  useResizeObserver(innerEl, () => updateInner());

  const scrollbarWidth = outerSize.width - innerSize.width;
  const scrollbarHeight = outerSize.height - innerSize.height - 1;

  const scrollableTuple = useState<ScrollableState>({
    stickyLeft: 0,
    stickyRight: 0,
    stickyTop: 0,
    stickyBottom: 0,
  });
  const [scrollableState] = scrollableTuple;
  const { stickyLeft, stickyRight, stickyTop } = scrollableState;

  return (
    <ScrollableContext.Provider value={scrollableTuple}>
      <Outer
        ref={outerEl}
        className={props.className}
        $marginLeft={props.marginLeft}
        $marginRight={props.marginRight ? props.marginRight - scrollbarWidth : 0}
        $marginTop={props.marginTop}
        $marginBottom={props.marginBottom ? props.marginBottom - scrollbarHeight : 0}
      >
        <Inner ref={innerEl} onScroll={updateInner}>
          {props.children}
        </Inner>
        <ShadowTop $top={stickyTop} $scrollbarWidth={scrollbarWidth} $visible={topShadow} />
        {bottomShadow && (
          <ShadowBottom
            $scrollbarWidth={scrollbarWidth}
            $scrollbarHeight={scrollbarHeight}
            $visible={bottomShadow}
          />
        )}
        <ShadowLeft
          $scrollbarHeight={scrollbarHeight}
          $visible={leftShadow}
          $left={stickyLeft - 1}
        />
        <ShadowRight
          $scrollbarHeight={scrollbarHeight}
          $scrollbarWidth={scrollbarWidth}
          $visible={rightShadow}
          $right={stickyRight - 1}
        />
      </Outer>
    </ScrollableContext.Provider>
  );
}

const Outer = styled.div<{
  $marginLeft?: number;
  $marginRight?: number;
  $marginTop?: number;
  $marginBottom?: number;
}>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  max-width: 100%;
  margin-left: ${(props) => props.$marginLeft ?? 0}px;
  margin-right: ${(props) => props.$marginRight ?? 0}px;
  margin-top: ${(props) => props.$marginTop ?? 0}px;
  margin-bottom: ${(props) => props.$marginBottom ?? 0}px;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-color: #8888 transparent;
`;

const ShadowTop = styled.div<{ $top: number; $scrollbarWidth?: number; $visible?: boolean }>`
  position: absolute;
  height: 256px;
  box-shadow: 0px 24px 32px -24px light-dark(#bbb, #000);
  top: ${(props) => props.$top - 256}px;
  left: 0px;
  right: ${(props) => props.$scrollbarWidth}px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  z-index: calc(var(--pf-t--global--z-index--xs) + 1);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;

const ShadowBottom = styled.div<{
  $scrollbarWidth: number;
  $scrollbarHeight: number;
  $visible: boolean;
}>`
  position: absolute;
  height: 256px;
  box-shadow: 0px -24px 32px -24px light-dark(#bbb, #000);
  bottom: ${(props) => props.$scrollbarHeight - 256}px;
  left: 0;
  right: ${(props) => props.$scrollbarWidth}px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  z-index: calc(var(--pf-t--global--z-index--xs) + 1);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;

const ShadowLeft = styled.div<{
  $left: number;
  $scrollbarHeight: number;
  $visible: boolean;
}>`
  position: absolute;
  width: 256px;
  box-shadow: 24px 0px 32px -24px light-dark(#ccc, #000);
  top: 0;
  left: ${(props) => props.$left - 256}px;
  bottom: ${(props) => props.$scrollbarHeight}px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  z-index: calc(var(--pf-t--global--z-index--xs) + 1);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;

const ShadowRight = styled.div<{
  $scrollbarHeight: number;
  $scrollbarWidth: number;
  $visible: boolean;
  $right: number;
}>`
  position: absolute;
  width: 256px;
  box-shadow: -24px 0px 32px -24px light-dark(#ccc, #000);
  right: ${(props) => props.$right + props.$scrollbarWidth - 256}px;
  top: 0;
  bottom: ${(props) => props.$scrollbarHeight}px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  z-index: calc(var(--pf-t--global--z-index--xs) + 1);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;
