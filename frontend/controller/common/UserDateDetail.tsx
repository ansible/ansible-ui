import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { RouteE } from '../../Routes';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export function UserDateDetail(props: { label: string; date: string; user: User }) {
  const { label, date, user } = props;

  const { t } = useTranslation();
  const dateStr = formatDateString(date);
  const username = user?.username || '';

  return (
    <PageDetail label={label}>
      {user ? (
        <Trans t={t}>
          {dateStr} by{' '}
          <Link to={RouteE.UserDetails.replace(':id', user.id.toString())}>{username}</Link>
        </Trans>
      ) : (
        dateStr
      )}
    </PageDetail>
  );
}
