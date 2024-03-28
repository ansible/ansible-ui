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
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteOrganizations } from '../hooks/useDeleteOrganizations';
import { edaAPI } from '../../../common/eda-utils';
import { EdaError } from '../../../common/EdaError';

export function OrganizationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    error,
    refresh,
  } = useGetItem<EdaOrganization>(edaAPI`/organizations/`, params.id);
  const pageNavigate = usePageNavigate();

  const deleteOrganizations = useDeleteOrganizations((deleted: EdaOrganization[]) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Organizations);
    }
  });

  const itemActions: IPageAction<EdaOrganization>[] = useMemo(() => {
    const itemActions: IPageAction<EdaOrganization>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit organization'),
        onClick: (organization) =>
          pageNavigate(EdaRoute.EditOrganization, { params: { id: organization.id } }),
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

  if (error) return <EdaError error={error} handleRefresh={refresh} />;
  if (!organization) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={organization?.name}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(EdaRoute.Organizations) },
          { label: organization?.name },
        ]}
        headerActions={
          <PageActions<EdaOrganization>
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

export function OrganizationPageTabs(props: { organization: EdaOrganization }) {
  const { organization } = props;
  const { t } = useTranslation();
  return (
    <PageRoutedTabs
      backTab={{
        label: t('Back to Organizations'),
        page: EdaRoute.Organizations,
        persistentFilterKey: 'organizations',
      }}
      tabs={[{ label: t('Details'), page: EdaRoute.OrganizationDetails }]}
      params={{ id: organization.id }}
    />
  );
}
