import { ReactElement } from 'react';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ElementModel,
  GraphElement,
  action,
} from '@patternfly/react-topology';
import {
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: (element: GraphElement) => void;
}

export function useEdgeMenuItems(t: (item: string) => string): MenuItem[] {
  return [
    {
      key: 'success',
      icon: (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      ),
      label: t('Run on success'),
      onClick: (element: GraphElement) => {
        action(() => {
          element.setData({
            tag: t('Run on success'),
            tagStatus: 'success',
            endTerminalStatus: 'success',
          });
        })();
      },
    },
    {
      key: 'always',
      icon: (
        <Icon status="info">
          <CircleIcon />
        </Icon>
      ),
      label: t('Run always'),
      onClick: (element: GraphElement) => {
        action(() => {
          element.setData({ tag: t('Run always'), tagStatus: 'info', endTerminalStatus: 'info' });
        })();
      },
    },
    {
      key: 'fail',
      icon: (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      ),
      label: t('Run on fail'),
      onClick: (element: GraphElement) => {
        action(() => {
          element.setData({
            tag: t('Run on fail'),
            tagStatus: 'danger',
            endTerminalStatus: 'fail',
          });
        })();
      },
    },
    {
      key: 'separator',
      label: '-',
    },
    {
      key: 'remove-link',
      icon: (
        <Icon status="danger">
          <TrashIcon />
        </Icon>
      ),
      isDanger: true,
      label: t('Remove link'),
      onClick: (element: GraphElement) => {
        action(() => {
          element.remove();
        })();
      },
    },
  ];
}

export function EdgeContextMenu(
  element: GraphElement<ElementModel, unknown>,
  t: (string: string) => string
) {
  const data = element.getData() as { tagStatus: string };

  const items = useEdgeMenuItems(t);
  return items.map((item) => {
    if (item.label === '-') {
      return <ContextMenuSeparator component="li" key={`separator:${item.key}`} />;
    }

    return (
      <ContextMenuItem
        data-cy={item.key}
        isSelected={item.key === data.tagStatus}
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
