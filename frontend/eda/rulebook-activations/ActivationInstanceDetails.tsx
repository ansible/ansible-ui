import { CodeBlock, CodeBlockCode, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  Scrollable,
} from '../../../framework';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { RouteObj } from '../../Routes';
import { ItemsResponse } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { PageDetailsSection } from '../common/PageDetailsSection';
import { API_PREFIX } from '../constants';
import { EdaActivationInstance } from '../interfaces/EdaActivationInstance';
import { EdaActivationInstanceLog } from '../interfaces/EdaActivationInstanceLog';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';

export function ActivationInstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: activationInstance } = useGet<EdaActivationInstance>(
    `${API_PREFIX}/activation-instances/${params.id ?? ''}/`
  );

  const { data: activationInstanceLog } = useGet<ItemsResponse<EdaActivationInstanceLog>>(
    `${API_PREFIX}/activation-instances/${params.id ?? ''}/logs/`
  );

  const { data: activation } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${activationInstance?.activation ?? ''}/`
  );

  const renderActivationDetailsTab = (
    activationInstance: EdaActivationInstance | undefined
  ): JSX.Element => {
    return (
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>
            {activationInstance?.name || `Instance ${activationInstance?.id || ''}`}
          </PageDetail>
          <PageDetail label={t('Activation status')}>{activationInstance?.status || ''}</PageDetail>
          <PageDetail label={t('Start date')}>
            {activationInstance?.started_at ? formatDateString(activationInstance?.started_at) : ''}
          </PageDetail>
          <PageDetail label={t('End date')}>
            {activationInstance?.ended_at ? formatDateString(activationInstance?.ended_at) : ''}
          </PageDetail>
        </PageDetails>
        <PageDetailsSection>
          {activationInstanceLog?.results?.length && (
            <PageDetail label={t('Output')}>
              <CodeBlock>
                <CodeBlockCode
                  style={{
                    minHeight: '150px',
                  }}
                  id="code-content"
                >
                  {activationInstanceLog?.results?.map((item) => item.log).join('\r\n')}
                </CodeBlockCode>
              </CodeBlock>
            </PageDetail>
          )}
        </PageDetailsSection>
      </Scrollable>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={activationInstance?.name ?? `Instance ${activationInstance?.id || ''}`}
        breadcrumbs={[
          { label: t('Rulebook activations'), to: RouteObj.EdaRulebookActivations },
          {
            label: activationInstance?.activation_name ?? (activation?.name || ''),
            to: RouteObj.EdaRulebookActivationDetails.replace(
              ':id',
              activationInstance?.activation || ''
            ),
          },
          {
            label: t('History'),
            to: RouteObj.EdaRulebookActivationDetailsHistory.replace(
              ':id',
              activationInstance?.activation || ''
            ),
          },
          { label: activationInstance?.name ?? `Instance ${activationInstance?.id || ''}` },
        ]}
      />
      {activationInstance ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderActivationDetailsTab(activationInstance)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
