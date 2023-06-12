import { PageCarouselCardPage } from './PageCarouselCardPage';
import { PageCarouselNav } from './PageCarouselNav';
import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, useLayoutEffect, useRef, useState, Children, useMemo } from 'react';

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

  const carouselPages = useMemo(() => {
    const pagesOfCards = [];
    for (let i = 0; i < Children.toArray(props.children).length; i = i + visibleCardsPerPage) {
      const page = Children.toArray(props.children).slice(i, i + visibleCardsPerPage);
      pagesOfCards.push(page);
    }

    return pagesOfCards.map((pageOfCards, index) => {
      return (
        <PageCarouselCardPage key={index} visibleCardsPerPage={visibleCardsPerPage}>
          {pageOfCards}
        </PageCarouselCardPage>
      );
    });
  }, [props.children, visibleCardsPerPage]);

  return (
    <>
      <div ref={ref}>{carouselPages[pageIndex]}</div>
      <PageCarouselNav
        setPage={setPageIndex}
        currentPage={pageIndex}
        totalPages={carouselPages.length}
      />
    </>
  );
}
