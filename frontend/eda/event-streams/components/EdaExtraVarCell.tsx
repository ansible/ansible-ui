import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { useGet } from '../../../common/crud/useGet';
import { EdaExtraVars } from '../../interfaces/EdaExtraVars';

export function EdaExtraVarsCell(props: {
  id?: number | null;
  disableLink?: boolean;
  label?: string;
  helpText?: string;
}) {
  const { data } = useGet<EdaExtraVars>(
    props.id ? `/api/eda/v1/extra-vars/${props.id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.id) {
      case 'number':
      case 'string':
        return <>{props.id}</>;
    }
    return <></>;
  }
  return (
    <PageDetailCodeEditor
      value={data?.extra_var}
      showCopyToClipboard={true}
      label={props.label}
      helpText={props.helpText}
    />
  );
}
