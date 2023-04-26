import useSWR from 'swr';
import { TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useFetcher } from '../../../common/crud/Data';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function EdaRulebookCell(props: { id?: number }) {
  const fetcher = useFetcher();
  const { data } = useSWR<EdaRulebook>(
    props.id ? `/api/eda/v1/rulebooks/${props.id}/` : undefined,
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
    <TextCell
      text={data.name}
      to={props.id ? RouteObj.EdaRulebookDetails.replace(':id', props.id.toString()) : undefined}
    />
  );
}
