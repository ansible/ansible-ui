/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import {
  PageHeader,
  PageLayout,
  PageActions,
  useGetPageUrl,
  LoadingPage,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGetItem } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxRoleRowActions } from './hooks/useAwxRoleRowActions';

export function AwxRolePage(props: {
  breadcrumbLabelForPreviousPage?: string;
  backTabLabel?: string;
}) {
  const getPageUrl = useGetPageUrl();
  const { t } = useTranslation();
  const params = useParams<{ id: string; resourceType: string }>();
  const pageNavigate = usePageNavigate();
  const {
    data: role,
    error,
    refresh,
  } = useGetItem<AwxRbacRole>(awxAPI`/role_definitions/`, params.id);

  const itemActions = useAwxRoleRowActions(() => {
    pageNavigate(AwxRoute.Roles);
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(AwxRoute.Roles),
          },
          { label: role?.name },
        ]}
        headerActions={
          <PageActions<AwxRbacRole>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={role}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: props.backTabLabel || t('Back to Roles'),
          page: AwxRoute.Roles,
          persistentFilterKey: 'awx-roles',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.RoleDetails }]}
        params={{ id: params.id ?? '' }}
      />
    </PageLayout>
  );
}
