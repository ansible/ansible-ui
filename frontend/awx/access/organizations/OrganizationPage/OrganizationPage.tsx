/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
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
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { Organization } from '../../../interfaces/Organization';
import { useDeleteOrganizations } from '../hooks/useDeleteOrganizations';
import { OrganizationAccess } from './OrganizationAccess';
import { OrganizationDetails } from './OrganizationDetails';
import { OrganizationTeams } from './OrganizationTeams';

export function OrganizationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    error,
    refresh,
  } = useGetItem<Organization>('/api/v2/organizations/', params.id);
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
        icon: EditIcon,
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
  const getPageUrl = useGetPageUrl();
  return (
    <RoutedTabs baseUrl={RouteObj.OrganizationPage}>
      <PageBackTab
        label={t('Back to Organizations')}
        url={getPageUrl(AwxRoute.Organizations)}
        persistentFilterKey="organizations"
      />
      <RoutedTab label={t('Details')} url={RouteObj.OrganizationDetails}>
        <OrganizationDetails organization={organization} />
      </RoutedTab>
      <RoutedTab label={t('Access')} url={RouteObj.OrganizationAccess}>
        <OrganizationAccess organization={organization} />
      </RoutedTab>
      <RoutedTab label={t('Teams')} url={RouteObj.OrganizationTeams}>
        <OrganizationTeams organization={organization} />
      </RoutedTab>
      <RoutedTab
        label={t('Execution environments')}
        url={RouteObj.OrganizationExecutionEnvironments}
      >
        <PageNotImplemented />
      </RoutedTab>
      <RoutedTab label={t('Notifications')} url={RouteObj.OrganizationNotifications}>
        <PageNotImplemented />
      </RoutedTab>
    </RoutedTabs>
  );
}
