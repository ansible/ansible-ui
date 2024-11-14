import { TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaOrganizationCell(props: { organization_id?: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaOrganization>(
    props.organization_id ? `/api/eda/v1/organizations/${props.organization_id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.organization_id) {
      case 'number':
      case 'string':
        return <>{props.organization_id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.organization_id
          ? getPageUrl(EdaRoute.OrganizationPage, {
              params: { id: data.id },
            })
          : undefined
      }
    />
  );
}
