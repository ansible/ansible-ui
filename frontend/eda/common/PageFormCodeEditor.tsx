import { Controller, useFormContext } from 'react-hook-form';
import {
  PageFormGroup,
  PageFormGroupProps,
} from '../../../framework/PageForm/Inputs/PageFormGroup';
import { CodeEditor, CodeEditorProps } from '@patternfly/react-code-editor';
import { editor } from 'monaco-editor';
import ICodeEditor = editor.ICodeEditor;

export type PageFormCodeEditorProps = {
  name: string;
  isReadOnly?: boolean;
  placeholder?: string;
} & CodeEditorProps &
  PageFormGroupProps;

/** PatternFly CodeEditor wrapper for use with react-hook-form */
export function PageFormCodeEditor(props: PageFormCodeEditorProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const onEditorDidMount = (
    editor: ICodeEditor,
    monaco: {
      editor: { getModels: () => { updateOptions: (arg0: { tabSize: number }) => void }[] };
    }
  ) => {
    // eslint-disable-next-line no-console
    console.log('Debug editor: ', editor);
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };

  return (
    <Controller
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <PageFormGroup
            {...props}
            helperTextInvalid={
              error?.type === 'required'
                ? typeof props.label === 'string'
                  ? `${props.label} is required`
                  : 'Required'
                : error?.message
            }
          >
            <CodeEditor
              id="code-editor"
              type="code"
              code={value as string}
              onCodeChange={(e) => onChange(e)}
              onEditorDidMount={onEditorDidMount}
              isReadOnly={props.isReadOnly || isSubmitting}
              height={props.height}
            />
          </PageFormGroup>
        );
      }}
    />
  );
}
