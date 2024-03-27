import { Label } from '@patternfly/react-core';
import {
  action,
  Edge,
  EdgeModel,
  GraphElement,
  Node,
  NodeModel,
  NodeStatus,
  useVisualizationController,
} from '@patternfly/react-topology';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useBulkConfirmation } from '../../../../../../framework';
import { START_NODE_ID } from '../constants';
import { EdgeStatus, GraphNode, type GraphEdgeData, type GraphNodeData } from '../types';
import { useCreateEdge } from './useCreateEdge';
import { useRemoveNode } from './useRemoveNode';

type resource = {
  summary_fields: {
    unified_job_template: {
      name: string;
    };
  };
};

type DataType = {
  resource?: resource;
};

export function useRemoveGraphElements() {
  const { t } = useTranslation();
  const removeNode = useRemoveNode();
  const controller = useVisualizationController();
  const createEdge = useCreateEdge();
  const handleRemoveNodes = action((nodes: GraphNode[]) => {
    nodes.forEach((element) => {
      removeNode(element);
    });

    controller.setState({ ...controller.getState(), modified: true });
    controller.getGraph().layout();
  });

  const nodeNameColumn = useMemo<ITableColumn<Node>>(
    () => ({
      header: t('Name'),
      cell: (item: Node) => {
        const data = item.getData() as DataType;
        const resource = data?.resource;
        const name = resource?.summary_fields?.unified_job_template?.name;
        return <TextCell text={name || t('DELETED')} iconSize="sm" />;
      },
    }),
    [t]
  );
  const nodeIdColumn = useMemo<ITableColumn<Node<NodeModel, GraphNodeData>>>(
    () => ({
      header: t('Identifier'),
      cell: (item: GraphElement<NodeModel, GraphNodeData>) => {
        const id = item.getData()?.resource.identifier;
        return <TextCell text={id} iconSize="sm" />;
      },
    }),
    [t]
  );

  const nodeConfirmationColumns = useMemo<ITableColumn<Node<NodeModel, GraphNodeData>>[]>(
    () => [nodeNameColumn, nodeIdColumn],
    [nodeNameColumn, nodeIdColumn]
  );

  const nodeActionColumns = useMemo(() => [nodeNameColumn], [nodeNameColumn]);
  const bulkAction = useBulkConfirmation<Node>();

  const removeNodes = useCallback(
    (nodes: GraphNode[]) => {
      const hasMultipleNodes = nodes.length > 1;
      bulkAction({
        keyFn: (item) => item.getId(),
        title: hasMultipleNodes ? t('Remove all steps') : t('Remove step'),
        items: nodes,
        confirmText: hasMultipleNodes
          ? t('Yes, I confirm that I want to remove these {{count}} nodes.', {
              count: nodes.length,
            })
          : t('Yes, I confirm that I want to remove this node.'),
        actionButtonText: hasMultipleNodes
          ? t('Remove all steps', { count: nodes.length })
          : t('Remove step'),
        isDanger: true,
        confirmationColumns: nodeConfirmationColumns,
        actionColumns: nodeActionColumns,
        actionFn: () => {
          handleRemoveNodes(nodes);
          return Promise.resolve();
        },
      });
    },
    [nodeActionColumns, bulkAction, nodeConfirmationColumns, t, handleRemoveNodes]
  );
  const sourceColumn = useMemo<ITableColumn<Edge>>(
    () => ({
      header: t('Source Node'),
      cell: (item: Edge) => {
        const source = item.getSource();
        return <TextCell text={source.getLabel() || t('DELETED')} iconSize="sm" />;
      },
    }),
    [t]
  );
  const targetColumn = useMemo<ITableColumn<Edge<EdgeModel, GraphEdgeData>>>(
    () => ({
      header: t('Target Node'),
      cell: (item: Edge<EdgeModel, GraphEdgeData>) => {
        const target = item.getTarget();
        return <TextCell text={target.getLabel()} iconSize="sm" />;
      },
    }),
    [t]
  );
  const statusColumn = useMemo<ITableColumn<Edge<EdgeModel, GraphEdgeData>>>(
    () => ({
      header: t('Status'),
      cell: (item: Edge<EdgeModel, GraphEdgeData>) => {
        const data = item.getData();
        if (!data) return null;
        function getStatusColor(tagStatus: string) {
          switch (tagStatus) {
            case 'success':
              return 'green';
            case 'danger':
              return 'red';
            case 'info':
              return 'blue';
          }
        }

        return <Label color={getStatusColor(data.tagStatus)}>{data.tag}</Label>;
      },
    }),
    [t]
  );
  const linkConfirmationColumns = useMemo<ITableColumn<Edge<EdgeModel, GraphEdgeData>>[]>(
    () => [sourceColumn, targetColumn, statusColumn],
    [sourceColumn, targetColumn, statusColumn]
  );

  const linkActionColumns = useMemo(
    () => [sourceColumn, targetColumn],
    [sourceColumn, targetColumn]
  );
  const linkBulkAction = useBulkConfirmation<Edge>();

  const handleRemoveLink = action((element: Edge) => {
    element.setVisible(false);
    element.getSource().setState({ modified: true });
    element.getTarget().setState({ modified: true });
    element.getSource().setNodeStatus(NodeStatus.default);
    element.getTarget().setNodeStatus(NodeStatus.default);
    const controller = element.getController();
    const model = controller.toModel();

    controller.setState({ ...controller.getState(), modified: true });
    const childNode = element.getTarget();
    const childNodeTargets = childNode.getTargetEdges();
    const visibleChildNodeTargets = childNodeTargets.filter((edge) => edge.isVisible());

    !visibleChildNodeTargets.length &&
      model.edges?.push(createEdge(START_NODE_ID, element.getTarget().getId(), EdgeStatus.info));

    controller.fromModel(model, true);
    controller.getGraph().layout();
  });
  const removeLink = useCallback(
    (element: Edge) => {
      linkBulkAction({
        keyFn: (item) => item.getId(),
        title: t('Remove link'),
        items: [element],
        confirmText: t('Yes, I confirm that I want to remove this link.'),
        actionButtonText: t('Remove link'),
        isDanger: true,
        confirmationColumns: linkConfirmationColumns,
        actionColumns: linkActionColumns,
        actionFn: () => {
          handleRemoveLink(element);
          return Promise.resolve();
        },
      });
    },
    [linkActionColumns, linkBulkAction, linkConfirmationColumns, t, handleRemoveLink]
  );
  return { removeNodes, removeLink };
}
