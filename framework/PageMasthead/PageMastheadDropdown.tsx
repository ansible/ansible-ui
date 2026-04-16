import {
  Dropdown,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
  type TooltipProps,
} from '@patternfly/react-core';
import { ReactNode, Ref, useCallback, useState } from 'react';
import { useBreakpoint } from '../components/useBreakPoint';

export function PageMastheadDropdown(props: {
  id: string;
  icon: ReactNode;
  label?: string;
  /** Optional tooltip content used to render a tooltip around the dropdown */
  tooltipContent?: TooltipProps['content'];
  /** Optional tooltip position. Has no effect if no `tooltipContent` prop is supplied */
  tooltipPosition?: TooltipProps['position'];
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((open) => !open), []);
  const onOpenChange = useCallback((open: boolean) => setIsOpen(open), []);
  const children = Array.isArray(props.children) ? props.children : [props.children];

  return (
    <Dropdown
      id={props.id}
      ouiaId={props.id}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <Toggle
          icon={props.icon}
          id={`${props.id}-menu-toggle`}
          isOpen={isOpen}
          label={props.label}
          tooltipContent={props.tooltipContent}
          tooltipPosition={props.tooltipPosition}
          onToggle={onToggle}
          toggleRef={toggleRef}
        />
      )}
      isOpen={isOpen}
      isPlain
      popperProps={{
        appendTo: () => document.body,
        preventOverflow: true,
        enableFlip: true,
        position: 'right',
      }}
      data-cy={props.id}
      data-testid={props.id}
    >
      <DropdownList>{children}</DropdownList>
    </Dropdown>
  );
}

function Toggle({
  icon,
  id,
  isOpen,
  label,
  tooltipContent,
  tooltipPosition,
  onToggle,
  toggleRef,
}: Readonly<{
  icon: ReactNode;
  id: string;
  isOpen: boolean;
  label?: string;
  /** Optional tooltip content used to render a tooltip around the dropdown */
  tooltipContent?: TooltipProps['content'];
  /** Optional tooltip position. Has no effect if no `tooltipContent` prop is supplied */
  tooltipPosition?: TooltipProps['position'];
  onToggle: () => void;
  toggleRef: Ref<MenuToggleElement>;
}>) {
  const showLabel = useBreakpoint('md');

  const toggle = (
    <MenuToggle id={id} isExpanded={isOpen} onClick={onToggle} ref={toggleRef} variant="plain">
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>{<Icon>{icon}</Icon>}</FlexItem>
        {showLabel && label && <FlexItem wrap="nowrap">{label}</FlexItem>}
      </Flex>
    </MenuToggle>
  );

  if (!tooltipContent) return toggle;

  return (
    <Tooltip content={tooltipContent} position={tooltipPosition} trigger="mouseenter focus click">
      {toggle}
    </Tooltip>
  );
}
