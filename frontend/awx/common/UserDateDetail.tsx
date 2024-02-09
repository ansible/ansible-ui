import { DateTimeCell, usePageNavigate } from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { AwxRoute } from '../main/AwxRoutes';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export function UserDateDetail(props: { label: string; date: string; user: User }) {
  const pageNavigate = usePageNavigate();
  return (
    <PageDetail label={props.label}>
      <DateTimeCell
        value={props.date}
        author={props?.user.username}
        onClick={() => pageNavigate(AwxRoute.UserDetails, { params: { id: props.user.id } })}
      />
    </PageDetail>
  );
}
