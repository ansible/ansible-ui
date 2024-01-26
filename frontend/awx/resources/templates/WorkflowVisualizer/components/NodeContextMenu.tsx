import { ReactElement } from 'react';
import {
  ContextMenuSeparator,
  ContextMenuItem,
  action,
  useVisualizationController,
  useVisualizationState,
  Node,
  NodeModel,
} from '@patternfly/react-topology';
import { PencilAltIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from 'react-i18next';
import { useViewOptions } from '../ViewOptionsProvider';
import { GraphNodeData } from '../types';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: () => void;
}

export function useNodeMenuItems(element: Node<NodeModel, GraphNodeData>): MenuItem[] {
  const { t } = useTranslation();
  const { selectedIds } = useVisualizationController().getState<{ selectedIds: string[] }>();
  const { setSidebarMode } = useViewOptions();
  const [_, setSelectedIds] = useVisualizationState('selectedIds', selectedIds);
  const { removeNodes } = useViewOptions();
  const id = element.getId();
  return [
    {
      key: 'edit-node',
      icon: <PencilAltIcon />,
      label: t('Edit node'),
      onClick: () => {
        action(() => {
          setSidebarMode('edit');
          setSelectedIds([id]);
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
      onClick: () => {
        removeNodes([element]);
      },
    },
  ];
}

export function NodeContextMenu(props: { element: Node<NodeModel, GraphNodeData> }) {
  const { element } = props;

  const items = useNodeMenuItems(element);
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
          item?.onClick && item.onClick();
        }}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
