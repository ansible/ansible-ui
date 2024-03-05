import { Popover, Button, PopoverPosition } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function HelperText(props: {
  content: React.ReactNode;
  header?: React.ReactNode;
  hasAutoWidth?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Popover
      aria-label={t`helper text popover`}
      data-cy="helper-text-popover"
      position={PopoverPosition.top}
      bodyContent={props.content}
      headerContent={props.header}
      hasAutoWidth={props.hasAutoWidth}
    >
      <Button iconPosition={'left'} variant={'plain'} className={'helper'} style={{ padding: '0' }}>
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );
}
