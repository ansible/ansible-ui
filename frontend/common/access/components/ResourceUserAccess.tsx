import { LabelsCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { useGetAll } from '@ansible/platform-ui/common/useGetAll';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { Alert, Content, ContentVariants, Label, PageSection } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRoleAccess } from '../interfaces/UserRoleAccess';
import { AccessList } from './AccessList';
import { PlatformIdForUsername } from './platformIdForUsername';

// Custom hook to get role definitions
function useRoleDefinitions() {
  const { items: roleDefinitions, isLoading } = useGetAll<{
    id: number;
    name: string;
    url: string;
  }>(gatewayAPI`/role_definitions/`, 200);
  return { roleDefinitions, isLoading };
}

export function ResourceUserAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  name?: string;
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
  const { roleDefinitions } = useRoleDefinitions();

  // Create a map of role names to role IDs for quick lookup
  const roleNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    roleDefinitions?.forEach((role) => {
      map.set(role.name, role.id);
    });
    return map;
  }, [roleDefinitions]);

  const roleUserRoleAccessURL = () => {
    switch (service) {
      case 'awx':
        return awxAPI`/role_user_access/${type}/${props.id}/`;
      case 'eda':
        return edaAPI`/role_user_access/${type}/${props.id}/`;
      default:
        return gatewayAPI`/role_user_access/${type}/${props.id}/`;
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
            cell: (item) => item?.first_name,
          },
          {
            header: t('Last name'),
            cell: (item) => item?.last_name,
          },
          {
            header: t('Roles'),
            cell: (item: UserRoleAccess) => {
              return item?.is_superuser ? (
                <Label>{t('AAP Administrator')}</Label>
              ) : (
                <LabelsCell
                  labelsWithLinks={item.object_role_assignments.map((obj) => {
                    return {
                      name: obj?.role_definition?.name,
                      link: getPageUrl(PlatformRoute.RoleDetails, {
                        params: { id: roleNameToIdMap.get(obj?.role_definition?.name) },
                      }),
                    };
                  })}
                />
              );
            },
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
