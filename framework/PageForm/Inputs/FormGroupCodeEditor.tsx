import { InputGroup } from '@patternfly/react-core';
import { CodeEditor, CodeEditorProps } from '@patternfly/react-code-editor';
import { ReactNode } from 'react';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type FormGroupCodeEditorProps = Pick<
  CodeEditorProps,
  | 'className'
  | 'code'
  | 'onEditorDidMount'
  | 'language'
  | 'isDarkTheme'
  | 'height'
  | 'width'
  | 'isLineNumbersVisible'
  | 'isReadOnly'
  | 'isLanguageLabelVisible'
  | 'loading'
  | 'emptyState'
  | 'emptyStateTitle'
  | 'emptyStateBody'
  | 'emptyStateButton'
  | 'emptyStateLink'
  | 'downloadFileName'
  | 'isUploadEnabled'
  | 'isDownloadEnabled'
  | 'isCopyEnabled'
  | 'copyButtonAriaLabel'
  | 'uploadButtonAriaLabel'
  | 'downloadButtonAriaLabel'
  | 'copyButtonToolTipText'
  | 'uploadButtonToolTipText'
  | 'downloadButtonToolTipText'
  | 'copyButtonSuccessTooltipText'
  | 'toolTipCopyExitDelay'
  | 'toolTipDelay'
  | 'toolTipMaxWidth'
  | 'toolTipPosition'
  | 'customControls'
  | 'isMinimapVisible'
  | 'headerMainContent'
  | 'shortcutsPopoverButtonText'
  | 'shortcutsPopoverProps'
  | 'showEditor'
  | 'options'
  | 'overrideServices'
  | 'onCodeChange'
> &
  PageFormGroupProps & { children?: ReactNode };

/** A PatternFly FormGroup with a PatternFly CodeEditor */
export function FormGroupCodeEditor(props: FormGroupCodeEditorProps) {
  const {
    helperTextInvalid: _helperTextInvalid,
    children: _children,
    isReadOnly,
    ...codeEditorProps
  } = props;
  const id = props.id
    ? props.id
    : typeof props.label === 'string'
    ? props.label.toLowerCase().split(' ').join('-')
    : undefined;
  return (
    <PageFormGroup {...props} id={id}>
      <InputGroup>
        <CodeEditor
          {...codeEditorProps}
          id={id}
          label={undefined}
          aria-describedby={id ? `${id}-form-group` : undefined}
        />
        {props.children}
      </InputGroup>
    </PageFormGroup>
  );
}
