import { Bullseye, Button, ButtonVariant } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const PageNavDotButton = styled(Button)<{ isCurrentPage: boolean }>`
  && {
    background-color: blue;
    height: 10px;
    width: 10px;
    border-radius: 50%;
    padding: 0;
    margin-left: 10px;
    margin-right: 10px;
    ${(props: { isCurrentPage: boolean }) =>
      props.isCurrentPage
        ? css`
            background-color: var(--pf-v5-global--primary-color--100);
          `
        : css`
            background-color: var(--pf-v5-global--disabled-color--200);
          `}
  }
`;
/**
 * Component for navigating across pages of cards in a carousel
 * The navigation elements comprise of previous and next arrow buttons surrounding one or more
 * interactible dots where each dot represents a page of cards
 */
export function PageCarouselNav(props: {
  setPage: (value: number) => void;
  currentPage: number;
  totalPages: number;
}) {
  const { setPage, currentPage, totalPages } = props;
  const { t } = useTranslation();

  // If the page is resized (enlarged) and the number of page dots reduce
  useEffect(() => {
    if (currentPage >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [currentPage, setPage, totalPages]);

  const pageDots = useMemo(() => {
    const dots = [];
    for (let i = 0; i < totalPages; i++) {
      dots.push(
        <PageNavDotButton
          key={i}
          variant={ButtonVariant.plain}
          onClick={() => {
            setPage(i);
          }}
          isCurrentPage={i === currentPage}
          aria-label={t(`Navigate to page {{currentPage}}.`, { currentPage })}
        ></PageNavDotButton>
      );
    }
    return dots;
  }, [currentPage, setPage, t, totalPages]);

  return (
    <div>
      <Bullseye aria-label={t('Navigation buttons')}>
        <Button
          variant={ButtonVariant.plain}
          isDisabled={currentPage === 0}
          icon={<AngleLeftIcon />}
          onClick={() => {
            setPage(Math.max(0, currentPage - 1));
          }}
          aria-label={t('Navigate to the previous page')}
        ></Button>
        {pageDots}
        <Button
          variant={ButtonVariant.plain}
          isDisabled={currentPage === totalPages - 1}
          icon={<AngleRightIcon />}
          onClick={() => {
            setPage(Math.min(totalPages - 1, currentPage + 1));
          }}
          aria-label={t('Navigate to the next page')}
        ></Button>
      </Bullseye>
    </div>
  );
}
