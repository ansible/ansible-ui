import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  PageLayout,
  Scrollable,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { edaAPI } from '../../common/eda-utils';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';

import { EdaError } from '../../common/EdaError';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaRolePermissions } from './components/EdaRolePermissions';

export function EdaRoleDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const {
    data: role,
    error,
    refresh,
  } = useGet<EdaRbacRole>(edaAPI`/role_definitions/${params.id ?? ''}/`);

  if (error) return <EdaError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <Scrollable>
        <PageDetails disableScroll={true}>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{role?.description || ''}</PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell
              value={role?.created}
              author={role?.summary_fields?.created_by?.username}
              onClick={() =>
                void navigate(
                  getPageUrl(EdaRoute.UserDetails, {
                    params: {
                      id: (role.summary_fields?.created_by?.username ?? 0).toString(),
                    },
                  })
                )
              }
            />
          </PageDetail>
          <PageDetail label={t('Modified')}>
            <DateTimeCell value={role?.modified} />
          </PageDetail>
          <PageDetail label={t('Editable')}>
            {role?.managed ? t('Built-in') : t('Editable')}
          </PageDetail>
        </PageDetails>
        <PageDetails disableScroll={true} numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <EdaRolePermissions role={role} />
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
