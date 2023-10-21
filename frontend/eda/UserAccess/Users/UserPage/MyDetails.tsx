/* eslint-disable react/prop-types */
import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, PageDetail, PageDetails } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet } from '../../../../common/crud/useGet';
import { API_PREFIX } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';

export function MyDetails() {
  const { t } = useTranslation();
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/me/`);

  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageDetails>
      <PageDetail label={t('Username')}>{user?.username}</PageDetail>
      <PageDetail label={t('First name')}>{user?.first_name}</PageDetail>
      <PageDetail label={t('Last name')}>{user?.last_name}</PageDetail>
      <PageDetail label={t('Email')}>{user?.email}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell format="date-time" value={user?.created_at} />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell format="date-time" value={user?.modified_at} />
      </PageDetail>
      {user?.roles && user.roles.length ? (
        <PageDetail label={t('Role(s)')}>
          <LabelGroup>
            {user.roles.map((role) => (
              <Label key={role?.id}>{role?.name}</Label>
            ))}
          </LabelGroup>
        </PageDetail>
      ) : (
        <></>
      )}
    </PageDetails>
  );
}
