/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  PageLayout,
  PageHeader,
  PageTable,
  usePageNavigate,
  TextCell,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxToken } from '../../../interfaces/AwxToken';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useAwxView } from '../../../common/useAwxView';
import { awxAPI } from '../../../common/api/awx-utils';

export function UserTokens() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [showTokens, setShowTokens] = useState(true);
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();
  const view = useAwxView<AwxToken>({ url: awxAPI`/tokens/` });
  const tableColumns = useMemo<ITableColumn<AwxToken>[]>(
    () => [
      {
        header: 'Application name',
        cell: () => <TextCell text={'app name'} />,
        card: 'name',
        list: 'name',
      },
    ],
    []
  );

  useEffect(() => {
    if (activeAwxUser?.id === undefined || activeAwxUser?.id.toString() !== params.id) {
      setShowTokens(false);
      // redirect to user details for the active/logged-in user
      pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } });
    }
  }, [activeAwxUser?.id, params.id, setShowTokens, pageNavigate]);

  // not showing anything when user does not match. this helps to test the component.
  return (
    <PageLayout>
      <PageHeader title={t('User Tokens')}></PageHeader>
      <PageTable<AwxToken>
        id="awx-user-tokens"
        errorStateTitle={t('Error loading tokens')}
        emptyStateTitle={t('There are currently no tokens added.')}
        tableColumns={tableColumns}
        {...view}
      />
    </PageLayout>
  );
}
