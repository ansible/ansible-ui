import { TextCell } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function EdaRulebookCell(props: { id?: number }) {
  const { data } = useGet<EdaRulebook>(
    props.id ? `/api/eda/v1/rulebooks/${props.id}/` : undefined,
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
  return <TextCell text={data.name} />;
}
