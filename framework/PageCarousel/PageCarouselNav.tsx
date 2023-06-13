import { Button, Bullseye, ButtonVariant } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';
import { CSSProperties, useEffect } from 'react';
import { useMemo } from 'react';

const pageDotStyle: CSSProperties = {
  height: 10,
  width: 10,
  borderRadius: '50%',
  backgroundColor: 'var(--pf-global--primary-color--100)',
  padding: 0,
  marginLeft: 10,
  marginRight: 10,
};

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
        <Button
          key={i}
          variant={ButtonVariant.plain}
          onClick={() => {
            setPage(i);
          }}
          style={
            i === currentPage
              ? { ...pageDotStyle }
              : {
                  ...pageDotStyle,
                  backgroundColor: 'var(--pf-global--disabled-color--200)',
                }
          }
        ></Button>
      );
    }
    return dots;
  }, [currentPage, setPage, totalPages]);

  return (
    <div>
      <Bullseye>
        <Button
          variant={ButtonVariant.plain}
          isDisabled={currentPage === 0}
          icon={<AngleLeftIcon />}
          onClick={() => {
            setPage(Math.max(0, currentPage - 1));
          }}
        ></Button>
        {pageDots}
        <Button
          variant={ButtonVariant.plain}
          isDisabled={currentPage === totalPages - 1}
          icon={<AngleRightIcon />}
          onClick={() => {
            setPage(Math.min(totalPages - 1, currentPage + 1));
          }}
        ></Button>
      </Bullseye>
    </div>
  );
}
