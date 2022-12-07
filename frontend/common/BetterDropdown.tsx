import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';

export function BetterDropdown(props: {
  label?: string;
  children?: ReactNode;
  position?: DropdownPosition | 'right' | 'left';
}) {
  const [open, setOpen] = useState(false);
  const onToggle = useCallback(() => setOpen((open) => !open), []);

  const items = useMemo(() => {
    if (!open) return [];
    return props.children;
  }, [open, props.children]);

  const toggle = props.label ? (
    <DropdownToggle toggleVariant="secondary" onToggle={onToggle}>
      {props.label}
    </DropdownToggle>
  ) : (
    <KebabToggle onToggle={onToggle} />
  );

  return (
    <Dropdown
      toggle={toggle}
      isOpen={open}
      isPlain
      dropdownItems={items as unknown[]}
      position={props.position}
    />
  );
}
