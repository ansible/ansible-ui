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

export function UserTokens(props: { infoMessage?: string }) {
  const params = useParams<{ id: string }>();
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeAwxUser === undefined || activeAwxUser?.id.toString() !== params.id) {
      // redirect to user details for the active/logged-in user
      pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } });
    }
  }, [activeAwxUser, params.id, pageNavigate]);

  if (!activeAwxUser) return <LoadingPage breadcrumbs tabs />;

  return activeAwxUser?.id.toString() === params.id ? (
    <UserTokensInternal user={activeAwxUser} infoMessage={props.infoMessage} />
  ) : (
    <></>
  );
}

function UserTokensInternal(props: { infoMessage?: string; user: AwxUser }) {
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
        href: getPageUrl(AwxRoute.CreateUserToken, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected tokens'),
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
        emptyStateTitle={t('There are currently no tokens added.')}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        {...view}
      />
    </PageLayout>
  );
}
