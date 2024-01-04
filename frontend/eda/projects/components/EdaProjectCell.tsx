import { TextCell, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaProjectCell(props: { id?: number | null; disableLink?: boolean }) {
  const { data } = useGet<EdaProject>(props.id ? `/api/eda/v1/projects/${props.id}/` : undefined, {
    dedupingInterval: 10 * 1000,
  });
  const getPageUrl = useGetPageUrl();
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
          ? getPageUrl(EdaRoute.ProjectPage, { params: { id: props.id } })
          : undefined
      }
    />
  );
}
