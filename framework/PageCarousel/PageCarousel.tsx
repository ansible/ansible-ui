import { PageCarouselCardPage } from './PageCarouselCardPage';
import { PageCarouselNav } from './PageCarouselNav';
import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, useLayoutEffect, useRef, useState, Children, useMemo, useEffect } from 'react';
import styled from 'styled-components';

const CardSpan = (1662 - 59) / 4;

const SlideContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

/**
 * A carousel component that displays children (eg. page cards) within it and switches
 * between pages of cards using smooth animation.
 */
export function PageCarousel(props: { children: ReactNode; carouselId: string }) {
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [visibleCardsPerPage, setVisibleCardsPerPage] = useState(1);

  useLayoutEffect(() => {
    setVisibleCardsPerPage(
      Math.max(1, Math.floor((slideContainerRef.current?.clientWidth ?? 0) / CardSpan))
    );
  }, []);

  useResizeObserver(slideContainerRef, (entry) => {
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

  useEffect(() => {
    const cardPage = document.getElementById(
      `page-carousel-cards-${props.carouselId}-${pageIndex}`
    );
    if (cardPage) {
      cardPage.scrollIntoView();
    }
  }, [pageIndex, props.carouselId]);

  return (
    <>
      <SlideContainer ref={slideContainerRef}>
        {pagesOfCards.map((pageOfCards, index) => {
          return (
            <PageCarouselCardPage
              pageIndex={index}
              key={index}
              visibleCardsPerPage={visibleCardsPerPage}
              carouselId={props.carouselId}
            >
              {pageOfCards}
            </PageCarouselCardPage>
          );
        })}
      </SlideContainer>
      {pagesOfCards.length > 1 ? (
        <PageCarouselNav
          setPage={setPageIndex}
          currentPage={pageIndex}
          totalPages={pagesOfCards.length}
        />
      ) : null}
    </>
  );
}
