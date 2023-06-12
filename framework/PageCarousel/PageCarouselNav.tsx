import { Button, Bullseye, ButtonVariant } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';

export function PageCarouselNav(props: {
  setPage: (value: number) => void;
  currentPage: number;
  totalPages: number;
}) {
  const { setPage, currentPage, totalPages } = props;
  return (
    // <Bullseye>
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
    // </Bullseye>
  );
}
