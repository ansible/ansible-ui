import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import useSWR from 'swr';
import { useFetcher } from '../../../common/crud/Data';
import { EdaExtraVars } from '../../interfaces/EdaExtraVars';

export function EdaExtraVarsCell(props: { id?: number | null; disableLink?: boolean }) {
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
    <CodeBlock>
      <CodeBlockCode
        style={{
          minHeight: '150px',
        }}
        id="code-content"
      >
        {JSON.stringify(data?.extra_var)}
      </CodeBlockCode>
    </CodeBlock>
  );
}
