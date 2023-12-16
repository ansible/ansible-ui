import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
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
import { EdaRoute } from '../../../EdaRoutes';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { useDeleteEventSource } from '../hooks/useDeleteEventSources';
import { edaAPI } from '../../../api/eda-utils';

export function EventSourcePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();

  const { data: eventSource } = useGet<EdaEventSourceRead>(
    edaAPI`/sources/`.concat(`${params.id ?? ''}/`),
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
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
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit event source'),
        onClick: (eventSource: EdaEventSourceRead) =>
          pageNavigate(EdaRoute.EditEventSource, {
            params: { id: eventSource.id },
          }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (eventSource: EdaEventSourceRead) => deleteEventSource([eventSource]),
        isDanger: true,
      },
    ],
    [deleteEventSource, pageNavigate, t]
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
