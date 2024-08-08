import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ButtonVariant } from '@patternfly/react-core';
import { useHubContext } from '../../../common/useHubContext';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import {
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { hubAPI } from '../../../common/api/formatPath';
import { useGet } from '../../../../common/crud/useGet';
import { useDeleteRoles } from '../hooks/useDeleteRoles';
import { HubRoute } from '../../../main/HubRoutes';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';

export function HubRolePage(props: {
  breadcrumbLabelForPreviousPage?: string;
  backTabLabel?: string;
}) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { user } = useHubContext();
  const pageNavigate = usePageNavigate();
  const { data: role } = useGet<HubRbacRole>(hubAPI`/_ui/v2/role_definitions/${params.id ?? ''}/`);
  const getPageUrl = useGetPageUrl();

  const deleteRoles = useDeleteRoles((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(HubRoute.Roles);
    }
  });

  const itemActions = useMemo<IPageAction<HubRbacRole>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be edited.')
            : user?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to edit this role. Please contact your system administrator if there is an issue with your access.'
                ),
        onClick: (role: HubRbacRole) =>
          pageNavigate(HubRoute.EditRole, { params: { id: role.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be deleted.')
            : user?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to delete this role. Please contact your system administrator if there is an issue with your access.'
                ),
        onClick: (role: HubRbacRole) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, pageNavigate, t, user?.is_superuser]
  );

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(HubRoute.Roles),
          },
          { label: role?.name },
        ]}
        headerActions={
          <PageActions<HubRbacRole>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={role}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: props.backTabLabel || t('Back to Roles'),
          page: HubRoute.Roles,
          persistentFilterKey: 'eda-roles',
        }}
        tabs={[{ label: t('Details'), page: HubRoute.RoleDetails }]}
        params={{ id: role?.id ?? '' }}
      />
    </PageLayout>
  );
}
