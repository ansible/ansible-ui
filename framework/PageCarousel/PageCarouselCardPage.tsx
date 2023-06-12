import React, { ReactNode, forwardRef } from 'react';

type PageCarouselCardPageProps = {
  /** The cards to be displayed within a page */
  children: ReactNode;
  /** The number of cards visible per page */
  visibleCardsPerPage: number;
  /** The index of the current active page */
  currentPage?: number;
};

/**
 * Component representing a page/view of cards.
 * A page of cards could be of size 4 cards, 3 cards, 2 cards or 1 card depending on the screen size.
 */
export const PageCarouselCardPage = forwardRef<HTMLDivElement, PageCarouselCardPageProps>(
  function PageCarouselCardPage(props, ref) {
    console.log(
      '🚀 ~ PageCarouselCardPage ~ props.visibleCardsPerPage:',
      props.visibleCardsPerPage
    );

    return (
      <div
        id="page-carousel-cards"
        ref={ref}
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: `repeat(${props.visibleCardsPerPage}, 1fr)`,
        }}
      >
        {props.children}
      </div>
    );
  }
);
