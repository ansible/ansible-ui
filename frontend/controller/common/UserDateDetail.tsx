import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RouteE } from '../../Routes';
import { Detail } from '../../../framework';
import { formatDateString } from './formatDateString';

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
    <Detail label={label}>
      {user ? (
        <Trans t={t}>
          {dateStr} by{' '}
          <Link to={RouteE.UserDetails.replace(':id', user.id.toString())}>{username}</Link>
        </Trans>
      ) : (
        dateStr
      )}
    </Detail>
  );
}
