import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaView } from '../../../common/useEventDrivenView';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useCredentialActions } from '../../credentials/hooks/useCredentialActions';
import { useCredentialsActions } from '../../credentials/hooks/useCredentialsActions';
import { useCredentialTypeCredentialsColumns } from '../hooks/useCredentialTypeCredentialsColumns';
import { useCredentialTypeCredentialsFilters } from '../hooks/useCredentialTypeCredentialsFilters';

export function CredentialTypeCredentials() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useCredentialTypeCredentialsFilters();
  const tableColumns = useCredentialTypeCredentialsColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/`,
    queryParams: { credential_type_id: `${params?.id || ''}` },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/eda-credentials/`);
  const canCreateCredential = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useCredentialActions(view);
  const noCredentialsState = (
    <PageTableEmptyState
      title={t('There are currently no credentials of this type created for your organization.')}
      description={t('Please create a credential by using the button below.')}
    >
      <ButtonLink
        icon={<PlusCircleIcon />}
        variant={ButtonVariant.primary}
        href={getPageUrl(EdaRoute.CreateCredential)}
      >
        {t('Create credential')}
      </ButtonLink>
    </PageTableEmptyState>
  );
  const noRightsState = (
    <PageTableEmptyState
      icon={CubesIcon}
      title={t('You do not have permission to create a credential.')}
      description={t(
        'Please contact your organization administrator if there is an issue with your access.'
      )}
    />
  );
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials for this type')}
        emptyState={canCreateCredential ? noCredentialsState : noRightsState}
        {...view}
        defaultSubtitle={t('Credentials')}
      />
    </PageLayout>
  );
}
