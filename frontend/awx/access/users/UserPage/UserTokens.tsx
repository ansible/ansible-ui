/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageLayout,
  PageTable,
  usePageNavigate,
  LoadingPage,
  IPageAction,
  PageActionType,
  PageActionSelection,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useAwxView } from '../../../common/useAwxView';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxUser } from '../../../interfaces/User';
import { Token } from '../../../interfaces/Token';
import { useUserTokensColumns } from '../hooks/useUserTokensColumns';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';
import { useUserTokensFilters } from '../hooks/useUserTokensFilters';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteUserTokens } from '../hooks/useDeleteUserTokens';

export function UserTokens(props: {
  id?: string;
  infoMessage?: string;
  createTokenRoute?: string;
}) {
  const params = useParams<{ id: string }>();
  const userId = props.id || params.id;
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeAwxUser === undefined || activeAwxUser?.id.toString() !== userId) {
      // redirect to user details for the active/logged-in user
      pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } });
    }
  }, [activeAwxUser, userId, pageNavigate]);

  if (!activeAwxUser) return <LoadingPage breadcrumbs tabs />;

  return activeAwxUser?.id.toString() === userId ? (
    <UserTokensInternal
      user={activeAwxUser}
      infoMessage={props.infoMessage}
      createRoute={props.createTokenRoute || AwxRoute.CreateUserToken}
    />
  ) : (
    <></>
  );
}

function UserTokensInternal(props: { infoMessage?: string; user: AwxUser; createRoute: string }) {
  const { user } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useUserTokensColumns();
  const toolbarFilters = useUserTokensFilters();
  const view = useAwxView<Token>({
    url: awxAPI`/users/${user.id.toString()}/tokens/`,
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
        href: getPageUrl(props.createRoute, { params: { id: user.id } }),
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
    [deleteTokens, getPageUrl, t, user.id, props.createRoute]
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
        id="awx-user-tokens"
        errorStateTitle={t('Error loading tokens')}
        emptyStateTitle={t('There are currently no tokens.')}
        emptyStateDescription={t('Create tokens by clicking the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateActions={toolbarActions.slice(0, 1)}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        {...view}
      />
    </PageLayout>
  );
}
