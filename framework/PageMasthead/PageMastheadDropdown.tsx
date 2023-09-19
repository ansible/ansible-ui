import { Dropdown, DropdownToggle, Flex, FlexItem } from '@patternfly/react-core';
import { ReactNode, useCallback, useState } from 'react';

export function PageMastheadDropdown(props: {
  id: string;
  icon: ReactNode;
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => setOpen((open) => !open), []);
  const onToggle = useCallback(() => setOpen((open) => !open), []);
  return (
    <Dropdown
      id={props.id}
      onSelect={onSelect}
      toggle={
        <DropdownToggle toggleIndicator={null} onToggle={onToggle}>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            flexWrap={{ default: 'nowrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>{props.icon}</FlexItem>
            <FlexItem wrap="nowrap">{props.label}</FlexItem>
          </Flex>
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={props.children}
      position="right"
      ouiaId={props.id}
      data-cy={props.id}
    />
  );
}
