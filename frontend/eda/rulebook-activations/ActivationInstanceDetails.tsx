import { PageSection, Skeleton, Stack } from '@patternfly/react-core';
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
import { PageDetailCodeEditor } from '../../../framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { AwxItemsResponse } from '../../awx/common/AwxItemsResponse';
import { RouteObj } from '../../common/Routes';
import { StatusCell } from '../../common/Status';
import { useGet } from '../../common/crud/useGet';
import { PageDetailsSection } from '../common/PageDetailsSection';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../constants';
import { EdaActivationInstance } from '../interfaces/EdaActivationInstance';
import { EdaActivationInstanceLog } from '../interfaces/EdaActivationInstanceLog';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';

export function ActivationInstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: activationInstance } = useGet<EdaActivationInstance>(
    `${API_PREFIX}/activation-instances/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const { data: activationInstanceLogInfo } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    `${API_PREFIX}/activation-instances/${params.id ?? ''}/logs/?page_size=1`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const { data: activationInstanceLog } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    `${API_PREFIX}/activation-instances/${params.id ?? ''}/logs/?page_size=${
      activationInstanceLogInfo?.count || 10
    }`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const { data: activation } = useGet<EdaRulebookActivation>(
    `${API_PREFIX}/activations/${activationInstance?.activation_id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const renderActivationDetailsTab = (
    activationInstance: EdaActivationInstance | undefined
  ): JSX.Element => {
    return (
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>
            {`${activationInstance?.id || ''} - ${activationInstance?.name || ''}`}
          </PageDetail>
          <PageDetail label={t('Status')}>
            {<StatusCell status={activationInstance?.status || 'unknown'} />}
          </PageDetail>
          <PageDetail label={t('Start date')}>
            {activationInstance?.started_at ? formatDateString(activationInstance?.started_at) : ''}
          </PageDetail>
          <PageDetail label={t('End date')}>
            {activationInstance?.ended_at ? formatDateString(activationInstance?.ended_at) : ''}
          </PageDetail>
        </PageDetails>
        <PageDetailsSection>
          {activationInstanceLog?.results?.length ? (
            <PageDetailCodeEditor
              label={t('Output')}
              value={activationInstanceLog?.results?.map((item) => item.log).join('\r\n')}
              showCopyToClipboard={true}
            />
          ) : null}
        </PageDetailsSection>
      </Scrollable>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={`${activationInstance?.id || ''} - ${activationInstance?.name || ''}`}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: RouteObj.EdaRulebookActivations },
          {
            label: activation?.name || '',
            to: RouteObj.EdaRulebookActivationDetails.replace(
              ':id',
              activationInstance?.activation_id.toString() || ''
            ),
          },
          {
            label: t('History'),
            to: RouteObj.EdaRulebookActivationDetailsHistory.replace(
              ':id',
              activationInstance?.activation_id.toString() || ''
            ),
          },
          { label: `${activationInstance?.id || ''} - ${activationInstance?.name || ''}` },
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
