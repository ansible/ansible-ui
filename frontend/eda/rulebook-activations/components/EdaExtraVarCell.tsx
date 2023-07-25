import useSWR from 'swr';
import { useFetcher } from '../../../common/crud/Data';
import { EdaExtraVars } from '../../interfaces/EdaExtraVars';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';

export function EdaExtraVarsCell(props: {
  id?: number | null;
  disableLink?: boolean;
  label?: string;
  helpText?: string;
}) {
  const fetcher = useFetcher();
  const { data } = useSWR<EdaExtraVars>(
    props.id ? `/api/eda/v1/extra-vars/${props.id}/` : undefined,
    fetcher,
    {
      dedupingInterval: 10 * 1000,
    }
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
      value={JSON.stringify(data?.extra_var)}
      showCopyToClipboard={true}
      label={props.label}
      helpText={props.helpText}
    />
  );
}
