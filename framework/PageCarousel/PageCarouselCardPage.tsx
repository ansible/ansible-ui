import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

const CardPageContainer = styled.div`
  display: grid;
  gap: 30px;
  margin-bottom: var(--pf-global--spacer--lg);
  padding-right: 8;
  flex: 0 0 100%;
  scroll-snap-align: start;
  ${(props: { visibleCardsPerPage: number }) =>
    props.visibleCardsPerPage &&
    css`
      grid-template-columns: repeat(${props.visibleCardsPerPage}, 1fr);
    `}
`;

type PageCarouselCardPageProps = {
  /** The cards to be displayed within a page */
  children: ReactNode;
  /** The number of cards visible per page */
  visibleCardsPerPage: number;
  /** The index of the page */
  pageIndex: number;
};

/**
 * Component representing a page/view of cards.
 * A page of cards could be of size 4 cards, 3 cards, 2 cards or 1 card depending on the screen size.
 */
export function PageCarouselCardPage(props: PageCarouselCardPageProps) {
  return (
    <CardPageContainer
      visibleCardsPerPage={props.visibleCardsPerPage}
      id={`page-carousel-cards-${props.pageIndex}`}
    >
      {props.children}
    </CardPageContainer>
  );
}
