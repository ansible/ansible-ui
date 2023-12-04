import { ReactElement } from 'react';
import { ContextMenuSeparator, ContextMenuItem, action } from '@patternfly/react-topology';
import { PencilAltIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import type { GraphNode } from '../types';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: (element: GraphNode) => void;
}

export function useNodeMenuItems(t: (item: string) => string): MenuItem[] {
  return [
    {
      key: 'edit-node',
      icon: <PencilAltIcon />,
      label: t('Edit node'),
      onClick: (element1) => {
        action(() => {
          const controller = element1.getController();
          controller.getGraph().setData({ ...controller.getGraph(), sideBarMode: 'edit' });
          controller.setState({
            ...controller.getState(),
            selectedIds: [element1.getData()?.resource.id.toString()],
          });
        })();
      },
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
      onClick: (element) => {
        action(() => {
          element.getTargetEdges().forEach((edge) => edge.remove());
          element.getSourceEdges().forEach((edge) => edge.remove());
          element.remove();
        })();
      },
    },
  ];
}

export function NodeContextMenu(props: { element: GraphNode; t: (string: string) => string }) {
  const { element, t } = props;
  const items = useNodeMenuItems(t);
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
        onClick={() => item?.onClick && item.onClick(element)}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
