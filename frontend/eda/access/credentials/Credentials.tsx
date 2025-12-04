import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialColumns } from './hooks/useCredentialColumns';
import { useCredentialFilters } from './hooks/useCredentialFilters';
import { useCredentialsActions } from './hooks/useCredentialsActions';
import { useEdaConfig } from '../../common/useEdaConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';

export function Credentials() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('EDA');
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const { data, isLoading: isLoadingCredentialOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(edaAPI`/eda-credentials/`);
  const canCreateCredential = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useCredentialActions(view);
  const config = useEdaConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        description={t(
          'Credentials are utilized by {{product}} for authentication when launching rulebooks.',
          { product }
        )}
        titleHelpTitle={t('Credentials')}
        titleHelp={t(
          'Credentials are utilized by {{product}} for authentication when launching rulebooks.',
          { product }
        )}
        titleDocLink={useGetDocsUrl(config, 'edaCredentials')}
      />
      {isLoadingCredentialOptions ? (
        <PageLoadingTable />
      ) : (
        <PageTable
          id="eda-credentials-table"
          tableColumns={tableColumns}
          toolbarActions={toolbarActions}
          toolbarFilters={toolbarFilters}
          rowActions={rowActions}
          errorStateTitle={t('Error loading credentials')}
          emptyState={
            canCreateCredential ? (
              <PageTableEmptyState
                title={t('There are currently no credentials created for your organization.')}
                description={t('Please create a credential by using the button below.')}
              >
                <ButtonLink
                  icon={<PlusCircleIcon />}
                  variant={ButtonVariant.primary}
                  href={getPageUrl(EdaRoute.CreateCredential)}
                  data-cy="create-credential"
                  data-testid="create-credential"
                >
                  {t('Create credential')}
                </ButtonLink>
              </PageTableEmptyState>
            ) : (
              <PageTableEmptyState
                icon={CubesIcon}
                title={t('You do not have permission to create a credential.')}
                description={t(
                  'Please contact your organization administrator if there is an issue with your access.'
                )}
              />
            )
          }
          {...view}
          defaultSubtitle={t('Credential')}
        />
      )}
    </PageLayout>
  );
}
