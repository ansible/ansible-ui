import { RefObject, useEffect, useState } from 'react';

function isAtBottom(el: HTMLElement) {
  const { clientHeight, scrollHeight, scrollTop } = el;
  const scrollTopMax = scrollHeight - clientHeight;
  return scrollTop >= scrollTopMax;
}

export function useScrollControls(
  containerRef: RefObject<HTMLElement>,
  isFollowModeEnabled: boolean,
  setIsFollowModeEnabled: (value: boolean) => void,
  numRows: number,
  isJobRunning: boolean
) {
  const [numTicksAtBottom, setNumTicksAtBottom] = useState(0);

  /* Keep scrolled to bottom if follow mode is enabled */
  useEffect(() => {
    if (!isFollowModeEnabled) {
      return;
    }
    const interval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isFollowModeEnabled, containerRef]);

  /* If job isn't running, wait a short delay to ensure view stays scrolled
     all the way to the bottom; then disable follow mode */
  useEffect(() => {
    if (!isFollowModeEnabled || isJobRunning) {
      return;
    }
    const interval = setInterval(() => {
      console.log(numTicksAtBottom);
      if (!containerRef.current) {
        console.log('no ref');
        return;
      }
      if (numTicksAtBottom >= 3) {
        console.log('turning follow mode off');
        setIsFollowModeEnabled(false);
        return;
      }

      if (isAtBottom(containerRef.current)) {
        console.log('incementing');
        setNumTicksAtBottom((prev) => prev + 1);
      } else {
        console.log('not at bottom');
        const { clientHeight, scrollHeight, scrollTop } = containerRef.current;
        const scrollTopMax = scrollHeight - clientHeight;
        console.log({
          clientHeight,
          scrollHeight,
          scrollTop,
          scrollTopMax,
          isAtBottom: scrollTop >= scrollTopMax,
        });
        setNumTicksAtBottom(0);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isFollowModeEnabled, isJobRunning, containerRef, numTicksAtBottom, setIsFollowModeEnabled]);

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
