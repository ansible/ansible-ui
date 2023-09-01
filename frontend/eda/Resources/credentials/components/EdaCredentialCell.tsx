import { TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { EdaCredential } from '../../../interfaces/EdaCredential';

export function EdaCredentialCell(props: { credential_id?: number | null }) {
  const { data } = useGet<EdaCredential>(
    props.credential_id ? `/api/eda/v1/credentials/${props.credential_id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.credential_id) {
      case 'number':
      case 'string':
        return <>{props.credential_id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.credential_id
          ? RouteObj.EdaCredentialDetails.replace(':id', props.credential_id.toString())
          : undefined
      }
    />
  );
}
