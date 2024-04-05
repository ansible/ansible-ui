/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteOrganizations } from '../hooks/useDeleteOrganizations';

export function OrganizationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    error,
    refresh,
  } = useGetItem<Organization>(awxAPI`/organizations/`, params.id);
  const pageNavigate = usePageNavigate();

  const deleteOrganizations = useDeleteOrganizations((deleted: Organization[]) => {
    if (deleted.length > 0) {
      pageNavigate(AwxRoute.Organizations);
    }
  });

  const itemActions: IPageAction<Organization>[] = useMemo(() => {
    const itemActions: IPageAction<Organization>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit organization'),
        onClick: (organization) =>
          pageNavigate(AwxRoute.EditOrganization, { params: { id: organization.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: (organization) => {
          if (!organization) return;
          deleteOrganizations([organization]);
        },
        isDanger: true,
      },
    ];
    return itemActions;
  }, [deleteOrganizations, pageNavigate, t]);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!organization) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={organization?.name}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(AwxRoute.Organizations) },
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
      {organization && <OrganizationPageTabs organization={organization} />}
    </PageLayout>
  );
}

export function OrganizationPageTabs(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();
  return (
    <PageRoutedTabs
      backTab={{
        label: t('Back to Organizations'),
        page: AwxRoute.Organizations,
        persistentFilterKey: 'organizations',
      }}
      tabs={[
        { label: t('Details'), page: AwxRoute.OrganizationDetails },
        { label: t('Users'), page: AwxRoute.OrganizationUsers },
        { label: t('Teams'), page: AwxRoute.OrganizationTeams },
        { label: t('Execution environments'), page: AwxRoute.OrganizationExecutionEnvironments },
        { label: t('Notifications'), page: AwxRoute.OrganizationNotifications },
      ]}
      params={{ id: organization.id }}
    />
  );
}
