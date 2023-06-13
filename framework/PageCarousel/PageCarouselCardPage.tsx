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
export function PageCarouselCardPage(props: PageCarouselCardPageProps) {
  return (
    <div
      id="page-carousel-cards"
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: `repeat(${props.visibleCardsPerPage}, 1fr)`,
        marginBottom: 'var(--pf-global--spacer--lg',
        paddingRight: 8,
      }}
    >
      {props.children}
    </div>
  );
}
