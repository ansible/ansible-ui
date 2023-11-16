import { ReactElement } from 'react';
import {
  ContextMenuSeparator,
  ContextMenuItem,
  ElementModel,
  GraphElement,
} from '@patternfly/react-topology';
import { EditIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { WorkflowVisualizerDispatch, WorkflowVisualizerState } from '../types';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: (element: WorkflowNode) => void;
}
export type WorkflowflowVisualizerTopologyState = WorkflowVisualizerState & {
  dispatch: WorkflowVisualizerDispatch;
};
export function useNodeMenuItems(
  dispatch: WorkflowVisualizerDispatch,
  t: (string: string) => string
): MenuItem[] {
  return [
    {
      key: 'edit-node',
      icon: <EditIcon />,
      label: t('Edit node'),
      onClick: () => alert(`Selected: Edit node`),
    },
    {
      key: 'add-link',
      icon: <PlusCircleIcon />,
      label: t('Add link'),
      onClick: () => alert(`Selected: Add Link`),
    },
    {
      key: 'add-node-and-link',
      icon: <PlusCircleIcon />,
      label: t('Add node and link'),
      onClick: () => alert(`Selected: Add Node and Link`),
    },
    {
      key: 'separator',
      label: '-',
    },
    {
      key: 'remove-node',
      icon: <MinusCircleIcon />,
      isDanger: true,
      label: t('Remove node'),
      onClick: (element: WorkflowNode) =>
        dispatch({
          type: 'TOGGLE_CONFIRM_DELETE_MODAL',
          value: [element],
        }),
    },
  ];
}

export function NodeContextMenu(
  element: GraphElement<ElementModel, unknown>,
  t: (string: string) => string
) {
  const controller = element.getController();
  const { dispatch, nodes }: WorkflowflowVisualizerTopologyState = controller.getState();

  const selectedNode = nodes.find((node: WorkflowNode) => {
    if ('id' in element && node.id.toString() === element.id) {
      return node;
    }
    return undefined;
  });

  const items = useNodeMenuItems(dispatch, t);

  return items.map((item) => {
    if (item.label === '-') {
      return <ContextMenuSeparator component="li" key={`separator:${item.key}`} />;
    }

    return (
      <ContextMenuItem
        data-cy={item.key}
        key={item.key}
        icon={item.icon}
        isDanger={item.isDanger}
        onClick={() => {
          if (selectedNode === undefined || !item.onClick) return null;
          return item?.onClick(selectedNode);
        }}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
