import { Button, InputGroup } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import {
  PageFormGroup,
  PageFormGroupProps,
} from '../../../framework/PageForm/Inputs/PageFormGroup';
import { CodeEditor, CodeEditorProps } from '@patternfly/react-code-editor';

export type FormGroupCodeEditorProps = Pick<
  CodeEditorProps,
  | 'code'
  | 'copyButtonAriaLabel'
  | 'copyButtonSuccessTooltipText'
  | 'copyButtonToolTipText'
  | 'customControls'
  | 'emptyState'
  | 'emptyStateBody'
  | 'emptyStateButton'
  | 'emptyStateLink'
  | 'emptyStateTitle'
  | 'headerMainContent'
  | 'height'
  | 'isCopyEnabled'
  | 'isDarkTheme'
  | 'isLineNumbersVisible'
  | 'isMinimapVisible'
  | 'isReadOnly'
  | 'language'
  | 'loading'
  | 'onChange'
  | 'onCodeChange'
  | 'onEditorDidMount'
  | 'options'
  | 'overrideServices'
  | 'shortcutsPopoverButtonText'
  | 'shortcutsPopoverProps'
  | 'showEditor'
  | 'toolTipCopyExitDelay'
  | 'toolTipDelay'
  | 'toolTipMaxWidth'
  | 'toolTipPosition'
  | 'uploadButtonAriaLabel'
  | 'uploadButtonToolTipText'
  | 'width'
> &
  PageFormGroupProps;

/** A PatternFly FormGroup with a PatternFly CodeEditor */
export function FormGroupCodeEditor(props: FormGroupCodeEditorProps) {
  const { helperTextInvalid: _helperTextInvalid, ...textAreaProps } = props;
  return (
    <PageFormGroup {...props}>
      <InputGroup>
        <CodeEditor
          {...textAreaProps}
          id={props.id}
          label={undefined}
          aria-describedby={props.id ? `${props.id}-form-group` : undefined}
        />
      </InputGroup>
    </PageFormGroup>
  );
}
