import {
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectProps,
  SelectVariant,
} from '@patternfly/react-core';
import React, {
  ChangeEvent,
  ReactElement,
  ReactNode,
  isValidElement,
  useCallback,
  useState,
} from 'react';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type FormGroupSelectProps = Pick<
  SelectProps,
  'footer' | 'isCreatable' | 'isGrouped' | 'onSelect' | 'placeholderText' | 'isDisabled'
> &
  PageFormGroupProps & {
    value?: string;
    isReadOnly?: boolean;
    placeholderText: string | ReactNode;
    selectedIcon?: ReactNode;
  };

/** A PatternFly FormGroup with a PatternFly Select */
export function FormGroupSelect(props: FormGroupSelectProps) {
  const {
    value,
    onSelect,
    children,
    helperTextInvalid,
    labelHelpTitle,
    labelHelp,
    helperText,
    isRequired,
    isReadOnly,
    additionalControls,
    placeholderText,
    ...selectProps
  } = props;
  const [open, setOpen] = useState(false);

  const onToggle = useCallback(() => setOpen((open) => !open), []);

  const onSelectHandler = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>,
      value: string | MySelectOptionObject
    ) => {
      if (typeof value === 'string') onSelect?.(event, value);
      else onSelect?.(event, value.value ?? '');
      setOpen(false);
    },
    [onSelect]
  );

  type MySelectOptionObject = SelectOptionObject & { value?: string };

  const selectOptionObject: MySelectOptionObject = {
    value,
    toString: () => {
      let selectedLabel: ReactNode;
      React.Children.toArray(children).forEach((child) => {
        if (!isValidElement(child)) return;
        if (child.type !== SelectOption) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        if (child.props.value === value) selectedLabel = child.props.children;
      });
      return (
        <Flex spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'nowrap' }}>
          {props.selectedIcon && <FlexItem>{props.selectedIcon}</FlexItem>}
          <FlexItem>{selectedLabel ?? value ?? ''}</FlexItem>
        </Flex>
      ) as unknown as string;
    },
    compareTo: (other: string | MySelectOptionObject) => {
      if (typeof other === 'string') return value === other;
      return value === other.value;
    },
  };

  return (
    <PageFormGroup {...props}>
      <Select
        {...selectProps}
        label={undefined}
        placeholderText={placeholderText}
        variant={SelectVariant.single}
        aria-describedby={props.id ? `${props.id}-form-group` : undefined}
        selections={selectOptionObject}
        onSelect={onSelectHandler}
        isOpen={open}
        onToggle={onToggle}
        maxHeight={280}
        validated={helperTextInvalid ? 'error' : undefined}
        isDisabled={props.isDisabled || isReadOnly}
        hasPlaceholderStyle
        style={{ zIndex: open ? 9999 : undefined }}
      >
        {children as ReactElement[]}
      </Select>
    </PageFormGroup>
  );
}
