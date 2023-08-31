import { TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { EdaProject } from '../../../interfaces/EdaProject';

export function EdaDecisionEnvironmentCell(props: { id?: number }) {
  const { data } = useGet<EdaProject>(
    props.id ? `/api/eda/v1/decision-environments/${props.id}/` : undefined,
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
    <TextCell
      text={data.name}
      to={
        props.id
          ? RouteObj.EdaDecisionEnvironmentDetails.replace(':id', props.id.toString())
          : undefined
      }
    />
  );
}
