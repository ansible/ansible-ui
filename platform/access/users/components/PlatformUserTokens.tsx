import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { usePageNavigate } from '../../../../framework';
import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';

export function PlatformUserTokens() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const edaService = useGatewayService('eda');

  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeUser === undefined || activeUser?.id.toString() !== params.id) {
      // redirect to user details for the active/logged-in user
      pageNavigate(PlatformRoute.UserDetails, { params: { id: activeUser?.id } });
    }
  }, [activeUser, params.id, pageNavigate]);

  const tokensTabs = useMemo(() => {
    return [
      { label: t('Ansible Automation Platform'), page: PlatformRoute.AAPUserTokens as string },
      ...(edaService
        ? [{ label: t('Automation Decisions'), page: PlatformRoute.EdaUserTokens as string }]
        : []),
    ];
  }, [edaService, t]);

  return <PageRoutedTabs tabs={tokensTabs} isBox={false} params={{ id: params.id }} />;
}
