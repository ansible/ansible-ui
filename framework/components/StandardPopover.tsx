import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

const PopoverButton = styled.button`
  padding: var(--pf-v5-global--spacer--xs);
  margin: -(var(--pf-v5-global--spacer--xs));
  font-size: var(--pf-v5-global--FontSize--sm);
  --pf-v5-c-form__group-label-help--Color: var(--pf-v5-global--Color--200);
  --pf-v5-c-form__group-label-help--hover--Color: var(--pf-v5-global--Color--100);
`;

function StandardPopover(props: {
  ariaLabel?: string;
  content: ReactNode;
  header: ReactNode;
  id?: string;
  maxWidth?: string;
}) {
  const { ariaLabel = '', content, header, id = '', maxWidth = '', ...rest } = props;
  const [translations] = useFrameworkTranslations();
  if (!content) {
    return null;
  }
  return (
    <Popover
      bodyContent={content}
      headerContent={header}
      hideOnOutsideClick
      id={id}
      data-cy={id}
      maxWidth={maxWidth}
      {...rest}
    >
      <PopoverButton
        aria-label={ariaLabel ?? translations.moreInformation}
        aria-haspopup="true"
        className="pf-v5-c-form__group-label-help"
        onClick={(e) => e.preventDefault()}
        type="button"
      >
        <HelpIcon />
      </PopoverButton>
    </Popover>
  );
}

export { StandardPopover };
