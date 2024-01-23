import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteEventSource } from '../hooks/useDeleteEventSources';

export function EventSourcePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();

  const { data: eventSource } = useGet<EdaEventSourceRead>(
    edaAPI`/sources/`.concat(`${params.id ?? ''}/`)
  );

  const deleteEventSource = useDeleteEventSource((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.EventSources);
    }
  });

  const itemActions = useMemo<IPageAction<EdaEventSourceRead>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (eventSource: EdaEventSourceRead) => deleteEventSource([eventSource]),
        isDanger: true,
      },
    ],
    [deleteEventSource, t]
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={eventSource?.name}
        breadcrumbs={[
          { label: t('Event Sources'), to: getPageUrl(EdaRoute.EventSources) },
          { label: eventSource?.name },
        ]}
        headerActions={
          <PageActions<EdaEventSourceRead>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={eventSource}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Event Sources'),
          page: EdaRoute.EventSources,
          persistentFilterKey: 'event_source',
        }}
        tabs={[{ label: t('Details'), page: EdaRoute.EventSourceDetails }]}
        params={{ id: eventSource?.id }}
      />
    </PageLayout>
  );
}
