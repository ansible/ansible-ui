import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

const PopoverButton = styled.button`
  padding: var(--pf-global--spacer--xs);
  margin: -(var(--pf-global--spacer--xs));
  font-size: var(--pf-global--FontSize--sm);
  --pf-c-form__group-label-help--Color: var(--pf-global--Color--200);
  --pf-c-form__group-label-help--hover--Color: var(--pf-global--Color--100);
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
        className="pf-c-form__group-label-help"
        onClick={(e) => e.preventDefault()}
        type="button"
      >
        <HelpIcon noVerticalAlign />
      </PopoverButton>
    </Popover>
  );
}

export { StandardPopover };
