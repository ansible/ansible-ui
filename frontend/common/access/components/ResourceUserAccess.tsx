import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { useTranslation } from 'react-i18next';
import { UserRoleAccess } from '../interfaces/UserRoleAccess';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { LabelsCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AccessList } from './AccessList';
import { PlatformIdForUsername } from './platformIdForUsername';
import { Alert, Content, ContentVariants, Label, PageSection } from '@patternfly/react-core';
import { UserFirstNameCell } from './UserFirstNameCell';
import { UserLastNameCell } from './UserLastNameCell';

export function ResourceUserAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: string;
  addRolesRoute?: string;
  manageRoleRoute?: string;
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
}) {
  const { type, service, ...rest } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const roleUserRoleAccessURL = () => {
    switch (service) {
      case 'awx':
        return awxAPI`/role_user_access/${type}/${props.id}/`;
      case 'eda':
        return edaAPI`/role_user_access/${type}/${props.id}/`;
      default:
        return hubAPI`/_ui/v2/role_user_access/${type}/${props.id}/`;
    }
  };

  return (
    <div>
      <PageSection>
        <Alert
          isInline
          variant="info"
          title={t(
            `This list includes all users that have assigned roles for this resource, whether assigned directly or inherited from a team`
          )}
        >
          <Content component={ContentVariants.p} style={{ paddingBottom: 0, marginBottom: 0 }}>
            {t(
              `Roles inherited from a team cannot be managed here. To modify these role assignments, manage the team's assignments.`
            )}
          </Content>
        </Alert>
      </PageSection>
      <AccessList<UserRoleAccess>
        {...rest}
        service={service}
        manageRolesRoute={props?.manageRoleRoute}
        tableColumnFunctions={{
          name: {
            function: (userAccess: UserRoleAccess) => userAccess?.username,
            label: t('Username'),
            to: (userAccess: UserRoleAccess) => {
              return getPageUrl(PlatformRoute.UserDetails, {
                params: { id: PlatformIdForUsername(userAccess?.username) },
              });
            },
          },
        }}
        additionalTableColumns={[
          {
            header: t('First name'),
            cell: (item) => <UserFirstNameCell userAccess={item} />,
            value: (item: UserRoleAccess) => item?.id,
          },
          {
            header: t('Last name'),
            cell: (item) => <UserLastNameCell userAccess={item} />,
            value: (item: UserRoleAccess) => item?.id,
          },
          {
            header: t('Roles'),
            cell: (item: UserRoleAccess) =>
              item?.is_superuser ? (
                <Label>{t('AAP Administrator')}</Label>
              ) : (
                <LabelsCell
                  labels={item?.object_role_assignments?.map((obj) => obj.role_definition?.name)}
                />
              ),
          },
        ]}
        toolbarNameColumnFiltersValues={{ label: t('Username'), query: 'username__icontains' }}
        url={roleUserRoleAccessURL()}
        content_type_model={type}
        accessListType={'user'}
        addRoleButtonText={t('Assign users')}
      />
    </div>
  );
}
