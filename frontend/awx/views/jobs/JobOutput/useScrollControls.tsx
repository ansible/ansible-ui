import { RefObject, useCallback, useEffect, useState, useRef } from 'react';

export function useScrollControls(
  containerRef: RefObject<HTMLElement>,
  isFollowModeEnabled: boolean,
  setIsFollowModeEnabled: (value: boolean) => void,
  numRows: number,
  isJobRunning: boolean
) {
  // const [forceSecondScrollToEnd, setForceSecondScroll] = useState(false);
  const [wasJobRunning, setWasJobRunning] = useState(isJobRunning);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    // console.log({ isFollowModeEnabled, numRows, forceSecondScrollToEnd });
    if (isFollowModeEnabled /*|| forceSecondScrollToEnd*/) {
      // console.log({
      //   scrollTop,
      //   scrollHeight,
      //   isHigher: scrollHeight < scrollTop,
      // });
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
      /*
        After scrolling to the bottom, the height of the element is more accurately
        calculated when the events at the bottom render. This can cause the total
        height to increase slightly, so we will need to scroll to the bottom a
        second time on the successive render.
      */
      // setForceSecondScroll(true);
    }
    // if (!isFollowModeEnabled) {
    //   setForceSecondScroll(false);
    // }
  }, [isFollowModeEnabled, numRows, containerRef]);

  useEffect(() => {
    if (wasJobRunning && !isJobRunning) {
      setTimeout(() => {
        setWasJobRunning(false);
      }, 1500);
    }
  }, [isJobRunning, wasJobRunning]);

  const onScroll = useCallback(() => {
    // console.log('onScroll');
    if (!containerRef.current) return;
    const { clientHeight, scrollHeight, scrollTop } = containerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;
    if (!isAtBottom && !wasJobRunning) {
      // console.log('disabling follow mode');
      setIsFollowModeEnabled(false);
    }
    lastScrollTop.current = scrollTop;
  }, [containerRef, setIsFollowModeEnabled, wasJobRunning]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.addEventListener('scroll', onScroll);

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [containerRef, onScroll]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0 });
    setIsFollowModeEnabled(false);
  };

  const scrollToBottom = () => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
    setIsFollowModeEnabled(true);
  };

  const scrollPageDown = () => {
    if (!containerRef.current) {
      return;
    }
    const { height } = containerRef.current.getBoundingClientRect();
    containerRef.current?.scrollBy({ top: height - 48 });
  };

  const scrollPageUp = () => {
    if (!containerRef.current) {
      return;
    }
    const { height } = containerRef.current.getBoundingClientRect();
    containerRef.current?.scrollBy({ top: (height - 48) * -1 });
    setIsFollowModeEnabled(false);
  };

  return {
    scrollToTop,
    scrollToBottom,
    scrollPageDown,
    scrollPageUp,
  };
}
