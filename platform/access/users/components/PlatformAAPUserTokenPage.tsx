import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { Token } from '../../../../frontend/awx/interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteUserTokens } from '../hooks/useDeleteAAPUserTokens';

export function PlatformAAPUserTokenPage() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; tokenid: string }>();
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(gatewayAPI`/tokens`, params.tokenid);

  const deleteTokens = useDeleteUserTokens((deleted: Token[]) => {
    if (deleted.length > 0) {
      pageNavigate(PlatformRoute.AAPUserTokens, { params: { id: params.id } });
    }
  });

  const itemActions: IPageAction<Token>[] = useMemo(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete token'),
        onClick: (token) => deleteTokens([token]),
        isDanger: true,
        isPinned: true,
      },
    ];
  }, [deleteTokens, t]);

  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;
  if (!token) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Token')}
        breadcrumbs={[
          {
            label: t('Ansible Automation Platform tokens'),
            to: getPageUrl(PlatformRoute.AAPUserTokens, {
              params: { id: params.id, tokenid: params.tokenid },
            }),
          },
          {
            label: token.summary_fields?.application?.name || t('Personal access token'),
          },
        ]}
        headerActions={
          <PageActions<Token>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={token}
          />
        }
      ></PageHeader>
      <PageRoutedTabs
        backTab={{
          label: t('Back to Ansible Automation Platform tokens'),
          page: PlatformRoute.AAPUserTokens,
          persistentFilterKey: 'user tokens',
        }}
        tabs={[{ label: t('Details'), page: PlatformRoute.AAPUserTokenDetails }]}
        params={{ id: params.id, tokenid: params.tokenid }}
      />
    </PageLayout>
  );
}
