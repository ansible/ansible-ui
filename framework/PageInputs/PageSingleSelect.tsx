import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { Children, ReactNode, isValidElement, useState } from 'react';

/**
 * Single select for the page framework.
 *
 * Uses the PF5 version of the select component
 */
export function PageSingleSelect(props: {
  id?: string;
  children: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
}) {
  const { value, onChange, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);

  const children = Children.toArray(props.children);
  let selectedText: ReactNode = undefined;
  for (const child of children) {
    if (!isValidElement(child)) continue;
    if (child.type !== SelectOption) continue;
    if ((child.props as { itemId: string }).itemId === value) {
      selectedText = (child.props as { children: ReactNode }).children;
      break;
    }
  }

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={props.id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: '100%', minWidth: 100 }}
    >
      {props.icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{props.icon}</span>}
      {selectedText ?? placeholder}
    </MenuToggle>
  );

  return (
    <Select
      selected={value}
      onSelect={(_, value: string | number | undefined) => {
        onChange(value as string);
        setIsOpen(false);
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={Toggle}
      // shouldFocusToggleOnSelect PF5??
      style={{ zIndex: isOpen ? 9999 : undefined }}
    >
      <SelectList>{props.children}</SelectList>
    </Select>
  );
}
