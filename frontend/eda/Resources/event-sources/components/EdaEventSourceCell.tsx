import { TextCell, useGetPageUrl } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { EdaProject } from '../../../interfaces/EdaProject';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaEventSourceCell(props: { id?: number }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaProject>(props.id ? `/api/eda/v1/sources/${props.id}/` : undefined, {
    dedupingInterval: 10 * 1000,
  });
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
      to={props.id ? getPageUrl(EdaRoute.EventSourcePage, { params: { id: props.id } }) : undefined}
    />
  );
}
