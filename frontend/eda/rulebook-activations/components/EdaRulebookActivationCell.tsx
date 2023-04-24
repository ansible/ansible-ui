import useSWR from 'swr';
import { TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useFetcher } from '../../../common/crud/Data';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function EdaRulebookActivationCell(props: { id?: number | null; disableLink?: boolean }) {
  const fetcher = useFetcher();
  const { data } = useSWR<EdaRulebookActivation>(
    props.id ? `/api/eda/v1/rulebookActivations/${props.id}/` : undefined,
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
      to={
        props.id && !props.disableLink
          ? RouteObj.EdaRulebookActivationDetails.replace(':id', props.id.toString())
          : undefined
      }
    />
  );
}
