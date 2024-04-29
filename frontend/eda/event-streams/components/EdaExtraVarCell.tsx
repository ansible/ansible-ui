import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';

export function EdaExtraVarsCell(props: {
  text?: string | null;
  disableLink?: boolean;
  label?: string;
  helpText?: string;
}) {
  return (
    <PageDetailCodeEditor
      value={props?.text || ''}
      showCopyToClipboard={true}
      label={props.label}
      helpText={props.helpText}
    />
  );
}
