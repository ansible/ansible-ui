/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../../framework';
import { useItem } from '../../../../common/useItem';
import { RouteObj } from '../../../../Routes';
import { Organization } from '../../../interfaces/Organization';
import { useDeleteOrganizations } from '../hooks/useDeleteOrganizations';
import { OrganizationAccess } from './OrganizationAccess';
import { OrganizationDetails } from './OrganizationDetails';
import { OrganizationTeams } from './OrganizationTeams';

export function OrganizationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const organization = useItem<Organization>('/api/v2/organizations', params.id ?? '0');
  const history = useNavigate();

  const deleteOrganizations = useDeleteOrganizations((deleted: Organization[]) => {
    if (deleted.length > 0) {
      history(RouteObj.Organizations);
    }
  });

  const itemActions: IPageAction<Organization>[] = useMemo(() => {
    const itemActions: IPageAction<Organization>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit organization'),
        onClick: () =>
          history(RouteObj.EditOrganization.replace(':id', organization?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: () => {
          if (!organization) return;
          deleteOrganizations([organization]);
        },
        isDanger: true,
      },
    ];
    return itemActions;
  }, [deleteOrganizations, history, organization, t]);

  return (
    <PageLayout>
      <PageHeader
        title={organization?.name}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteObj.Organizations },
          { label: organization?.name },
        ]}
        headerActions={
          <PageActions<Organization>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={organization}
          />
        }
      />
      <PageTabs loading={!organization}>
        <PageTab label={t('Details')}>
          <OrganizationDetails organization={organization!} />
        </PageTab>
        <PageTab label={t('Access')}>
          <OrganizationAccess organization={organization!} />
        </PageTab>
        <PageTab label={t('Teams')}>
          <OrganizationTeams organization={organization!} />
        </PageTab>
        <PageTab label={t('Execution environments')}>TODO</PageTab>
        <PageTab label={t('Notifications')}>TODO</PageTab>
      </PageTabs>
    </PageLayout>
  );
}
