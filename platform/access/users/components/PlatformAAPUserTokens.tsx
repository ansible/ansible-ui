/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { DetailInfo } from '../../../../framework/components/DetailInfo';
import { Token } from '../../../../frontend/awx/interfaces/Token';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUserTokensColumns } from '../hooks/useAAPUserTokensColumns';
import { useUserTokensFilters } from '../hooks/useAAPUserTokensFilters';
import { useDeleteUserTokens } from '../hooks/useDeleteAAPUserTokens';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';

export function AAPUserTokens(props: { infoMessage?: string }) {
  const params = useParams<{ id: string }>();
  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeUser === undefined || activeUser?.id.toString() !== params.id) {
      // redirect to user details for the active/logged-in user
      pageNavigate(PlatformRoute.UserDetails, { params: { id: activeUser?.id } });
    }
  }, [activeUser, params.id, pageNavigate]);

  if (!activeUser) return <LoadingPage breadcrumbs tabs />;

  return activeUser?.id.toString() === params.id ? (
    <AAPUserTokensInternal user={activeUser} infoMessage={props.infoMessage} />
  ) : (
    <></>
  );
}

function AAPUserTokensInternal(props: { infoMessage?: string; user: PlatformUser }) {
  const { user } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useUserTokensColumns();
  const toolbarFilters = useUserTokensFilters();
  const view = usePlatformView<Token>({
    url: gatewayAPI`/users/${user.id.toString()}/tokens/`,
    toolbarFilters,
    tableColumns,
  });
  const deleteTokens = useDeleteUserTokens(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create token'),
        href: getPageUrl(PlatformRoute.CreateAapUserToken, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete tokens'),
        isDanger: true,
        onClick: deleteTokens,
      },
    ],
    [deleteTokens, getPageUrl, t, user.id]
  );

  const rowActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete token'),
        isDanger: true,
        isPinned: true,
        onClick: (token) => {
          deleteTokens([token]);
        },
      },
    ],
    [deleteTokens, t]
  );

  return (
    <PageLayout>
      {props.infoMessage && <DetailInfo title={t(props.infoMessage)}></DetailInfo>}
      <PageTable<Token>
        id="aap-user-tokens"
        errorStateTitle={t('Error loading tokens')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no tokens.')}
            description={t('Create tokens by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(PlatformRoute.CreateAapUserToken, { params: { id: user.id } })}
            >
              {t('Create token')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        {...view}
      />
    </PageLayout>
  );
}
