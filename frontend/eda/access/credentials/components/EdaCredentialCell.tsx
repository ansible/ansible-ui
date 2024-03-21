import { TextCell, useGetPageUrl } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaCredentialCell(props: { eda_credential_id?: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaCredential>(
    props.eda_credential_id ? `/api/eda/v1/eda-credentials/${props.eda_credential_id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.eda_credential_id) {
      case 'number':
      case 'string':
        return <>{props.eda_credential_id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.eda_credential_id
          ? getPageUrl(EdaRoute.CredentialPage, {
              params: { id: data.id },
            })
          : undefined
      }
    />
  );
}
