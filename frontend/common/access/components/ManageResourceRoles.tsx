import {
  PageForm,
  QueryParams,
  useBulkActionDialog,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { getAddedAndRemovedPlatformRoles } from '@ansible/platform-ui/access/organizations/utils/getAddedAndRemovedPlatformRoles';
import { usePlatformRoleColumns } from '@ansible/platform-ui/access/roles/hooks/usePlatformRoleColumns';
import { usePlatformRolesFilters } from '@ansible/platform-ui/access/roles/hooks/usePlatformRolesFilters';
import { ViewIndirectlyAssignedRolesModal } from '@ansible/platform-ui/access/users/components/ViewIndirectlyAssignedRolesModal';
import { useGetPlatformRolesForUser } from '@ansible/platform-ui/access/users/hooks/useGetPlatformRolesForUser';
import { usePlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { Alert, Button, Content, ContentVariants } from '@patternfly/react-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { postRequest, requestDelete } from '../../crud/Data';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}
interface UserAndPlatformRole {
  user?: PlatformUser;
  platformRole: PlatformRbacRole & RemoveRole;
}
export interface ResourceType {
  id: string;
  name: string;
  organization?: { id: string; name: string };
  summary_fields: {
    organization: { id: string; name: string };
  };
}

const HelpText = styled(Content)`
  margin-block: var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--md);
`;

const IndirectAssignmentsButton = styled(Button)`
  margin-left: calc(var(--pf-v6-c-button--PaddingBlockStart) * -1);
`;

export function ManageResourceRoles(props: { resource?: ResourceType; user?: PlatformUser }) {
  const toolbarFilters = usePlatformRolesFilters();
  const { resource } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const progressDialog = useBulkActionDialog<UserAndPlatformRole>();
  const getPageUrl = useGetPageUrl();
  const [isIndirectRolesModalOpen, setIsIndirectRolesModalOpen] = useState(false);

  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();
  const user = props?.user;

  const { selectedRoles: initialRoles } = useGetPlatformRolesForUser(
    params.resource_type ?? '',
    params.resource_id ?? '',
    `${user?.id ?? ''}`
  );
  const defaultValue = useMemo(
    () => ({
      platformRoles: initialRoles ?? [],
    }),
    [initialRoles]
  );
  // If the user saves then immediately re-enters the manage
  // roles form, the old assignments are sometimes still cached
  // in swr. This ensures the updated values show in the form
  // when that occurs.
  useEffect(() => {
    view.unselectAll();
    view.selectItems(initialRoles);
  }, [initialRoles]); // eslint-disable-line react-hooks/exhaustive-deps

  const progressDialogActionFunction = useCallback(
    (item: UserAndPlatformRole, signal: AbortSignal): Promise<unknown> | undefined => {
      if (item.platformRole) {
        if (item.platformRole.remove) {
          return requestDelete(
            gatewayAPI`/role_user_assignments/` +
              `${item.platformRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            gatewayAPI`/role_user_assignments/`,
            {
              user: item?.user?.id ?? '',
              role_definition: item.platformRole.id,
              content_type__api_slug: params.resource_type,
              object_id: params.resource_id,
            },
            signal
          );
        }
      }
    },
    [params.resource_id, params.resource_type]
  );

  const onSubmit = () => {
    const updatedPlatformRoles = view.selectedItems;
    const platformRolesData: (PlatformRbacRole & { remove?: boolean })[] = [];

    if (initialRoles?.length) {
      const platformRoles = getAddedAndRemovedPlatformRoles(
        initialRoles as (PlatformRbacRole & RemoveRole)[],
        updatedPlatformRoles
      );
      platformRolesData.push(...(platformRoles as (PlatformRbacRole & { remove?: boolean })[]));
    } else {
      platformRolesData.push(...updatedPlatformRoles);
    }

    const platformUserRolePairs: UserAndPlatformRole[] = [];
    if (platformRolesData) {
      for (const platformRole of platformRolesData) {
        platformUserRolePairs.push({ user, platformRole });
      }
    }
    const items = platformUserRolePairs;

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Manage roles'),
        description: <Trans>The roles listed below have been changed.</Trans>,
        keyFn: (item) => item.platformRole.id,
        items,
        actionColumns: [
          {
            header: t('Role'),
            cell: (item) => item.platformRole.name,
          },
          {
            header: t('Assignment type'),
            cell: (item) => {
              if (item.platformRole) {
                return item.platformRole.remove ? t('Removed') : t('Added');
              }
            },
          },
        ],
        actionFn: progressDialogActionFunction as (
          item: UserAndPlatformRole,
          signal: AbortSignal
        ) => Promise<unknown>,
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          void navigate(-1);
        },
      });
    });
  };

  const onCancel = () => void navigate(-1);

  const handleViewIndirectRoles = () => {
    setIsIndirectRolesModalOpen(true);
  };

  const handleCloseIndirectRolesModal = () => {
    setIsIndirectRolesModalOpen(false);
  };

  const tableColumns = usePlatformRoleColumns({ disableLinks: true, disableExtraColumns: true });

  const queryParams = useMemo<QueryParams>(() => {
    const queryParams: QueryParams = { content_type__api_slug: params.resource_type ?? '' };
    return queryParams;
  }, [params.resource_type]);

  const view = usePlatformView<PlatformRbacRole>({
    url: gatewayAPI`/role_definitions/`,
    toolbarFilters,
    tableColumns,
    queryParams,
    defaultSelection: initialRoles,
    disableQueryString: true,
  });

  return (
    <PageForm
      submitText={t`Save roles`}
      onSubmit={onSubmit}
      cancelText={t`Cancel`}
      onCancel={onCancel}
      defaultValue={defaultValue}
      disableGrid
    >
      <Alert
        isInline
        variant="info"
        style={{ paddingBottom: 0, marginBottom: 0 }}
        title={t(`Indirectly assigned roles, which are inherited through a team assignment, and direct organization roles that give 
            ${user?.username ?? ''} access to ${resource?.name} cannot be managed here.`)}
      >
        <Content component={ContentVariants.p} style={{ paddingBottom: 0, marginBottom: 0 }}>
          <Trans>
            To view these indirectly assigned roles click the button below. To modify indirect
            assignments, manage the team&apos;s assignments, to modify direct organization roles,
            manage{' '}
            {
              <Link
                to={getPageUrl(PlatformRoute.OrganizationUsers, {
                  params: {
                    id: resource?.organization?.id ?? resource?.summary_fields?.organization?.id,
                  },
                })}
              >
                {resource?.organization?.name ?? resource?.summary_fields?.organization?.name}
              </Link>
            }{' '}
            roles assignments.
          </Trans>
        </Content>
        <Content>
          <IndirectAssignmentsButton
            variant="link"
            onClick={handleViewIndirectRoles}
          >{t`View indirectly assigned roles`}</IndirectAssignmentsButton>
        </Content>
      </Alert>
      <HelpText component={ContentVariants.p}>
        {t('Selected roles will be directly assigned to {{username}}.', {
          username: user?.username ?? '',
        })}
      </HelpText>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
        errorStateTitle={t('Error loading roles')}
      />
      <ViewIndirectlyAssignedRolesModal
        isOpen={isIndirectRolesModalOpen}
        onClose={handleCloseIndirectRolesModal}
        userId={user?.id?.toString() ?? ''}
        userAnsibleId={params.user_id ?? ''}
        username={user?.username}
        resourceId={params.resource_id ?? ''}
        resourceType={params.resource_type ?? ''}
        resourceName={resource?.name}
        isManageResourceRoles={true}
      />
    </PageForm>
  );
}
