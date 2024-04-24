import { ReactNode } from 'react';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
  Tooltip,
} from '@patternfly/react-core';
import { ClipboardCheckIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function PromptDetail(props: {
  children?: ReactNode;
  isEmpty?: boolean;
  isOverridden?: boolean;
  label?: string;
  overriddenValue?: ReactNode;
}) {
  const { t } = useTranslation();
  const { label, children, isOverridden = false, overriddenValue = '', isEmpty = false } = props;

  if (children === null || typeof children === 'undefined' || children === '') {
    return <></>;
  }
  if (isEmpty) {
    return <></>;
  }

  let tooltip = null;
  if (isOverridden) {
    const overriddenText = t(`This prompt value has been overriden. The default value was: `);
    const tooltipContent = (
      <>
        {overriddenText} {overriddenValue}
      </>
    );

    tooltip = (
      <Tooltip position="right" content={tooltipContent}>
        <Icon isInline size="lg" iconSize="sm">
          <Button aria-label="Clipboard" variant="plain" id="tt-ref">
            <ClipboardCheckIcon />
          </Button>
        </Icon>
      </Tooltip>
    );
  }

  return (
    <DescriptionListGroup>
      {label && (
        <DescriptionListTerm>
          {label}
          {tooltip}
        </DescriptionListTerm>
      )}
      <DescriptionListDescription>{children}</DescriptionListDescription>
    </DescriptionListGroup>
  );
}
