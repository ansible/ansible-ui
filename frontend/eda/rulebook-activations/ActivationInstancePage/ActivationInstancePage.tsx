import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function ActivationInstancePage() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: activationInstance } = useGet<EdaActivationInstance>(
    `${API_PREFIX}/activation-instances/${params.instanceId ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );
  const { data: activation } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${activationInstance?.activation_id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={`${activationInstance?.id || ''} - ${activationInstance?.name || ''}`}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          {
            label: activation?.name || '',
            to: getPageUrl(EdaRoute.RulebookActivationPage, { params: { id: activation?.id } }),
          },
          {
            label: t('History'),
            to: getPageUrl(EdaRoute.RulebookActivationHistory, {
              params: { id: activation?.id },
            }),
          },
          { label: `${activationInstance?.id || ''} - ${activationInstance?.name || ''}` },
        ]}
      />
      <PageRoutedTabs
        tabs={[{ label: t('Details'), page: EdaRoute.RulebookActivationInstanceDetails }]}
        params={{ id: activationInstance?.activation_id, instanceId: params.instanceId }}
      />
    </PageLayout>
  );
}
