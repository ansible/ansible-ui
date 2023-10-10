import { TextInputProps } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { PageFormGroupProps } from './PageFormGroup';

export type FormGroupTextInputProps = Pick<
  TextInputProps,
  | 'placeholder'
  | 'value'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'validated'
  | 'onChange'
  | 'type'
  | 'aria-label'
  | 'autoFocus'
  | 'innerRef'
  | 'minLength'
  | 'maxLength'
  | 'onBlur'
  | 'min'
  | 'max'
> &
  PageFormGroupProps & {
    children?: ReactNode;
  };
