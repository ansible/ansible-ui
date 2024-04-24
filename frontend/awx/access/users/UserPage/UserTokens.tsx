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

export function UserTokens() {
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
    <UserTokensInternal user={activeAwxUser} />
  ) : (
    <></>
  );
}

function UserTokensInternal(props: { user: AwxUser }) {
  const { user } = props;
  const { t } = useTranslation();

  const tableColumns = useUserTokensColumns(user.id);
  const toolbarFilters = useUserTokensFilters();
  const view = useAwxView<Token>({
    url: awxAPI`/users/${user.id.toString()}/tokens/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create token'),
        href: '',
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected tokens'),
        isDanger: true,
        onClick: () => {},
      },
    ],
    [t]
  );

  const rowActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete token'),
        isDanger: true,
        onClick: () => {},
      },
    ],
    [t]
  );

  return (
    <PageLayout>
      <DetailInfo
        title={t(
          'Automation Execution tokens authenticate and connect to your Automation Execution Platform instance to run automation.'
        )}
        isPlain={false}
      ></DetailInfo>
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
