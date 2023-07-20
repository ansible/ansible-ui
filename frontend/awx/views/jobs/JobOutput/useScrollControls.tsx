import { RefObject, useCallback, useEffect, useState } from 'react';

export function useScrollControls(
  containerRef: RefObject<HTMLElement>,
  isFollowModeEnabled: boolean,
  setIsFollowModeEnabled: (value: boolean) => void,
  numRows: number
) {
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(isFollowModeEnabled);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    console.log({ isFollowModeEnabled, numRows, isScrolledToEnd });
    if (isFollowModeEnabled || isScrolledToEnd) {
      // outputEndRef.current?.scrollIntoView();
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
      setIsScrolledToEnd(true);
    }
    if (!isFollowModeEnabled) {
      setIsScrolledToEnd(false);
    }
  }, [isFollowModeEnabled, isScrolledToEnd, numRows, containerRef]);

  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    console.log('X onScroll');
  }, [containerRef]);

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
    setIsScrolledToEnd(false);
  };

  const scrollToBottom = () => {
    if (!containerRef.current) {
      return;
    }
    // outputEndRef.current?.scrollIntoView();
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
    setIsFollowModeEnabled(true);
    // setIsScrolledToEnd(true);
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
  };

  return {
    scrollToTop,
    scrollToBottom,
    scrollPageDown,
    scrollPageUp,
  };
}
