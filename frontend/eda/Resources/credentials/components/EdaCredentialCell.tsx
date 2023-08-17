import { TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { useGet } from '../../../../common/crud/useGet';
import { EdaCredential } from '../../../interfaces/EdaCredential';

export function EdaCredentialCell(props: { id?: number | null }) {
  const { data } = useGet<EdaCredential>(
    props.id ? `/api/eda/v1/credentials/${props.id}/` : undefined,
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
      to={props.id ? RouteObj.EdaCredentialDetails.replace(':id', props.id.toString()) : undefined}
    />
  );
}
