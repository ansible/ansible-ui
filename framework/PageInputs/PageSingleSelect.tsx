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
}) {
  const { value, onChange, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);

  const children = Children.toArray(props.children);
  let selectedText: ReactNode = children.length.toString();
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
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: 200 }}
    >
      {selectedText ?? placeholder}
    </MenuToggle>
  );

  return (
    <Select
      id={props.id}
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
