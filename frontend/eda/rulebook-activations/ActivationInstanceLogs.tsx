import { useTranslation } from 'react-i18next';
import { PageLayout, PageTable } from '../../../framework';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';
import { useActivationInstanceLogsColumns } from './hooks/useActivationInstanceLogsColumns';
import { EdaActivationInstanceLog } from '../interfaces/EdaActivationInstanceLog';
import { useParams } from 'react-router-dom';
import { Fragment } from 'react';

export function ActivationInstanceLogs() {
  const { t } = useTranslation();
  const tableColumns = useActivationInstanceLogsColumns();
  const params = useParams<{ id: string }>();

  const view = useEdaView<EdaActivationInstanceLog>({
    url: `${API_PREFIX}/activation-instances/${params.id ?? ''}/logs/`,
    disableQueryString: true,
    tableColumns,
  });

  return view.itemCount && view.itemCount > 0 ? (
    <PageLayout>
      <PageTable
        disableBodyPadding={true}
        compact
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading activation instance logs')}
        emptyStateTitle={t('There are currently no activation instance logs.')}
        {...view}
        defaultSubtitle={t('Activation instance log')}
      />
    </PageLayout>
  ) : (
    <Fragment />
  );
}
