import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { edaAPI } from '../../common/eda-utils';
import { useEdaActiveUser } from '../../common/useEdaActiveUser';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteEdaRoles } from './hooks/useDeleteEdaRoles';
import { ButtonVariant } from '@patternfly/react-core';

export function EdaRolePage(props: {
  breadcrumbLabelForPreviousPage?: string;
  backTabLabel?: string;
}) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { activeEdaUser } = useEdaActiveUser();
  const pageNavigate = usePageNavigate();
  const { data: role } = useGet<EdaRbacRole>(edaAPI`/role_definitions/${params.id ?? ''}/`);
  const getPageUrl = useGetPageUrl();

  const deleteRoles = useDeleteEdaRoles((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Roles);
    }
  });

  const itemActions = useMemo<IPageAction<EdaRbacRole>[]>(
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
            : activeEdaUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        onClick: (role: EdaRbacRole) =>
          pageNavigate(EdaRoute.EditRole, { params: { id: role.id } }),
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
            : activeEdaUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to delete this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        onClick: (role: EdaRbacRole) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, pageNavigate, t, activeEdaUser?.is_superuser]
  );

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(EdaRoute.Roles),
          },
          { label: role?.name },
        ]}
        headerActions={
          <PageActions<EdaRbacRole>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={role}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: props.backTabLabel || t('Back to Roles'),
          page: EdaRoute.Roles,
          persistentFilterKey: 'eda-roles',
        }}
        tabs={[{ label: t('Details'), page: EdaRoute.RoleDetails }]}
        params={{ id: role?.id ?? '' }}
      />
    </PageLayout>
  );
}
