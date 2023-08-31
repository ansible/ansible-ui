import { TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { EdaProject } from '../../../interfaces/EdaProject';

export function EdaProjectCell(props: { id?: number | null; disableLink?: boolean }) {
  const { data } = useGet<EdaProject>(props.id ? `/api/eda/v1/projects/${props.id}/` : undefined, {
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
      to={
        props.id && !props.disableLink
          ? RouteObj.EdaProjectDetails.replace(':id', props.id.toString())
          : undefined
      }
    />
  );
}
