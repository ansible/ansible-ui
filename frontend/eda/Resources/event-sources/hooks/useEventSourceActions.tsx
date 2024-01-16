import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { EdaEventSource } from '../../../interfaces/EdaEventSource';
import { useDeleteEventSources } from './useDeleteEventSources';
import { IEdaView } from '../../../common/useEventDrivenView';

export function useEventSourceActions(view: IEdaView<EdaEventSource>) {
  const { t } = useTranslation();
  const deleteEventSources = useDeleteEventSources(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaEventSource>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete event source'),
        onClick: (eventSource: EdaEventSource) => deleteEventSources([eventSource]),
        isDanger: true,
      },
    ],
    [deleteEventSources, t]
  );
}
