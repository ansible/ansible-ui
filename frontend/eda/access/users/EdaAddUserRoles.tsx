import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageLayout,
  PageHeader,
  usePageNavigate,
  LoadingPage,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaUser } from '../../interfaces/EdaUser';

import { EdaAddRoles } from '../common/EdaAddRoles';

export function EdaAddUserRoles(props: { id?: string; userRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { data: user, isLoading } = useGet<EdaUser>(edaAPI`/users/${props.id || params.id || ''}/`);

  if (isLoading || !user) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Add roles')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(EdaRoute.UserDetails, { params: { id: user?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(EdaRoute.UserRoles, { params: { id: user?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <EdaAddRoles
        id={user.id.toString()}
        type={'user'}
        onClose={() => {
          pageNavigate(props.userRolesRoute || EdaRoute.UserRoles, {
            params: { id: params.id },
          });
        }}
      />
    </PageLayout>
  );
}
