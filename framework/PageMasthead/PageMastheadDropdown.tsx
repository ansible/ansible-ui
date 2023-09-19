import { Dropdown, DropdownItem, DropdownToggle, Flex, FlexItem } from '@patternfly/react-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';

interface IPageMastheadDroptionItem {
  id: string;
  icon?: ReactNode;
  label: ReactNode;
  onClick: () => void;
}

export function PageMastheadDropdown(props: {
  id: string;
  icon: ReactNode;
  label?: string;
  items: IPageMastheadDroptionItem[];
}) {
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => setOpen((open) => !open), []);
  const onToggle = useCallback(() => setOpen((open) => !open), []);
  const dropdownItems = useMemo(
    () =>
      props.items.map((item) => (
        <DropdownItem
          key={item.id}
          id={item.id}
          ouiaId={item.id}
          data-cy={item.id}
          onClick={item.onClick}
          icon={item.icon}
        >
          {item.label}
        </DropdownItem>
      )),
    [props.items]
  );
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
      dropdownItems={dropdownItems}
      position="right"
      ouiaId={props.id}
      data-cy={props.id}
    />
  );
}
