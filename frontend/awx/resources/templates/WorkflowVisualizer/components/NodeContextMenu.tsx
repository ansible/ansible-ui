import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ContextMenuSeparator, ContextMenuItem } from '@patternfly/react-topology';
import { PencilAltIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: () => void;
}

export function useNodeMenuItems(): MenuItem[] {
  const { t } = useTranslation();
  return [
    {
      key: 'edit-node',
      icon: <PencilAltIcon />,
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
      onClick: () => alert(`Selected: Remove Node`),
    },
  ];
}

export function NodeContextMenu() {
  const items = useNodeMenuItems();

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
        onClick={item.onClick}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
