import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkConfirmation, ITableColumn, TextCell } from '../../../../../../framework';
import { action, useVisualizationController } from '@patternfly/react-topology';
import type { GraphNode } from '../types';

export function useRemoveAllNodes() {
  const { t } = useTranslation();

  const controller = useVisualizationController();
  const handleRemoveAllNodes = action(() => {
    controller.getElements().forEach((element) => {
      controller.removeElement(element);
    });
  });

  const nameColumn = useMemo<ITableColumn<GraphNode>>(
    () => ({
      header: t('Name'),
      cell: (item: GraphNode) => <TextCell text={item.getLabel() || t('DELETED')} iconSize="sm" />,
    }),
    [t]
  );
  const idColumn = useMemo<ITableColumn<GraphNode>>(
    () => ({
      header: t('Identifier'),
      cell: (item: GraphNode) => (
        <TextCell text={item.getData()?.resource.identifier} iconSize="sm" />
      ),
    }),
    [t]
  );
  const confirmationColumns = useMemo<ITableColumn<GraphNode>[]>(
    () => [nameColumn, idColumn],
    [nameColumn, idColumn]
  );
  const actionColumns = useMemo(() => [nameColumn], [nameColumn]);

  const bulkAction = useBulkConfirmation<GraphNode>();
  const removeAllNodes = (nodes: GraphNode[]) => {
    bulkAction({
      keyFn: (item) => item.getId(),
      title: t('Remove all nodes'),
      items: nodes,
      confirmText: t('Yes, I confirm that I want to remove these {{count}} nodes.', {
        count: nodes.length,
      }),
      actionButtonText: t('Remove all nodes', { count: nodes.length }),
      isDanger: true,
      confirmationColumns,
      actionColumns,
      actionFn: () => {
        handleRemoveAllNodes();
        return Promise.resolve();
      },
    });
  };
  return removeAllNodes;
}
