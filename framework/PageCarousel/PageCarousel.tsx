import { PageCarouselCardPage } from './PageCarouselCardPage';
import { PageCarouselNav } from './PageCarouselNav';
import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, useLayoutEffect, useRef, useState, Children, useMemo } from 'react';
import SwipeableViews from 'react-swipeable-views-react-18-fix';

const CardSpan = (1662 - 59) / 4;

/**
 * A carousel component that displays children (eg. page cards) within it and switches
 * between pages of cards using smooth animation.
 */
export function PageCarousel(props: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [visibleCardsPerPage, setVisibleCardsPerPage] = useState(1);

  useLayoutEffect(() => {
    setVisibleCardsPerPage(Math.max(1, Math.floor((ref.current?.clientWidth ?? 0) / CardSpan)));
  }, []);

  useResizeObserver(ref, (entry) => {
    setVisibleCardsPerPage(Math.max(1, Math.floor((entry.contentRect.width ?? 0) / CardSpan)));
  });

  const pagesOfCards = useMemo(() => {
    const pages = [];
    for (let i = 0; i < Children.toArray(props.children).length; i = i + visibleCardsPerPage) {
      const page = Children.toArray(props.children).slice(i, i + visibleCardsPerPage);
      pages.push(page);
    }
    return pages;
  }, [props.children, visibleCardsPerPage]);

  return (
    <>
      <SwipeableViews enableMouseEvents index={pageIndex}>
        {pagesOfCards.map((pageOfCards, index) => {
          return (
            <PageCarouselCardPage key={index} ref={ref} visibleCardsPerPage={visibleCardsPerPage}>
              {pageOfCards}
            </PageCarouselCardPage>
          );
        })}
      </SwipeableViews>
      <PageCarouselNav
        setPage={setPageIndex}
        currentPage={pageIndex}
        totalPages={pagesOfCards.length}
      />
    </>
  );
}
