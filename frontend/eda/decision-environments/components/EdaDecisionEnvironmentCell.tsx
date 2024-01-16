import { TextCell, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaDecisionEnvironmentCell(props: { id: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaProject>(
    props.id ? `/api/eda/v1/decision-environments/`.concat(`${props.id}/`) : undefined,
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
          ? getPageUrl(EdaRoute.DecisionEnvironmentPage, { params: { id: props.id } })
          : undefined
      }
    />
  );
}
