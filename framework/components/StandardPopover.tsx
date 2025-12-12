import { Icon, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { useFrameworkTranslations } from '../useFrameworkTranslations';

const PopoverButton = styled.button`
  padding: var(--pf-t--global--spacer--xs);
  font-size: var(--pf-t--global--icon--size--font--body--sm);
  color: var(--pf-t--global--text--color--link--default);
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
      data-testid={id}
      maxWidth={maxWidth}
      {...rest}
    >
      <PopoverButton
        aria-label={ariaLabel ?? translations.moreInformation}
        aria-haspopup="true"
        className="pf-v6-c-button pf-m-plain"
        onClick={(e) => e.preventDefault()}
        type="button"
      >
        <Icon
          size="sm"
          status="custom"
          style={
            {
              '--pf-v6-c-icon__content--m-custom--Color':
                'var(--pf-t--global--text--color--link--default)',
            } as React.CSSProperties
          }
        >
          <HelpIcon />
        </Icon>
      </PopoverButton>
    </Popover>
  );
}

export { StandardPopover };
