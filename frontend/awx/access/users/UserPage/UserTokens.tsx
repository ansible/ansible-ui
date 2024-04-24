/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageLayout,
  PageHeader,
  PageTable,
  usePageNavigate,
  LoadingPage,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useAwxView } from '../../../common/useAwxView';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxUser } from '../../../interfaces/User';
import { Token } from '../../../interfaces/Token';
import { useUserTokensColumns } from '../hooks/useUserTokensColumns';

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

  return <UserTokensInternal user={activeAwxUser} />;
}

function UserTokensInternal(props: { user: AwxUser }) {
  const { user } = props;
  const { t } = useTranslation();

  const view = useAwxView<Token>({ url: awxAPI`/users/${user.id.toString()}/tokens/` });
  const tableColumns = useUserTokensColumns(user.id);

  return (
    <PageLayout>
      <PageHeader title={t('User Tokens')}></PageHeader>
      <PageTable<Token>
        id="awx-user-tokens"
        errorStateTitle={t('Error loading tokens')}
        emptyStateTitle={t('There are currently no tokens added.')}
        tableColumns={tableColumns}
        {...view}
      />
    </PageLayout>
  );
}
