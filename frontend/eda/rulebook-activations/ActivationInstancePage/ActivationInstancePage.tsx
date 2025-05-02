import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';

export function ActivationInstancePage() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: activationInstance } = useGet<EdaActivationInstance>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/`
  );
  const { data: activation } = useGet<EdaRulebookActivation>(
    edaAPI`/activations/`.concat(`${activationInstance?.activation_id ?? ''}/`)
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
        params={{
          id: activationInstance?.activation_id || undefined,
          instanceId: params.instanceId,
        }}
      />
    </PageLayout>
  );
}
