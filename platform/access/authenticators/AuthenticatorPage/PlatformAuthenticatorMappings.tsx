import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useMappingFilters } from '../hooks/useMappingFilters';
import { useMappingColumns } from '../hooks/useMappingColumns';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useMappingRowActions, useMappingToolbarActions } from '../hooks/useMappingActions';

export function PlatformAuthenticatorMappings() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useMappingFilters();
  const tableColumns = useMappingColumns();

  const params = useParams<{ id: string }>();

  const view = usePlatformView<AuthenticatorMap>({
    url: gatewayAPI`/authenticators/${params.id ?? ''}/authenticator_maps/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useMappingToolbarActions(view, params?.id ?? '');
  const rowActions = useMappingRowActions(view.unselectItemsAndRefresh);

  return (
    <PageTable<AuthenticatorMap>
      id="platform-authenticator-mapping-table"
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      toolbarActions={toolbarActions}
      errorStateTitle={t('Error loading mappings')}
      emptyState={
        <PageTableEmptyState
          title={t('No authentication mappings')}
          description={t('To get started, create an authentication mapping.')}
        >
          <ButtonLink
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.primary}
            href={getPageUrl(PlatformRoute.CreateAuthenticatorMapping, {
              params: { id: params.id },
            })}
          >
            {t('Create mapping')}
          </ButtonLink>
        </PageTableEmptyState>
      }
      {...view}
    />
  );
}
