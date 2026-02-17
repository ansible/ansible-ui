import { TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaCredentialCell(props: {
  eda_credential_id?: number | null;
  disableLink?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaCredential>(
    props.eda_credential_id ? edaAPI`/eda-credentials/${props.eda_credential_id}/` : undefined,
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
        props.eda_credential_id && !props.disableLink
          ? getPageUrl(EdaRoute.CredentialPage, {
              params: { id: data.id },
            })
          : undefined
      }
    />
  );
}
