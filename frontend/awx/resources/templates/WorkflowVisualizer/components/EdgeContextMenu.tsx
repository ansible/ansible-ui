import { ReactElement } from 'react';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  Edge,
  ElementModel,
  action,
} from '@patternfly/react-topology';
import {
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useSetVisualizerModified } from '../hooks/useSetVisualizerModified';
import { EdgeStatus } from '../types';

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: () => void;
}

export function useEdgeMenuItems(
  element: Edge<
    ElementModel,
    {
      tag: string;
      tagStatus: EdgeStatus;
      endTerminalStatus: string;
    }
  >
): MenuItem[] {
  const { t } = useTranslation();
  return [
    {
      key: 'success',
      icon: (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      ),
      label: t('Run on success'),
      onClick: () => {
        action(() => {
          element.setData({
            tag: t('Run on success'),
            tagStatus: EdgeStatus.success,
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
      onClick: () => {
        action(() => {
          element.setData({
            tag: t('Run always'),
            tagStatus: EdgeStatus.info,
            endTerminalStatus: 'info',
          });
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
      onClick: () => {
        action(() => {
          element.setData({
            tag: t('Run on fail'),
            tagStatus: EdgeStatus.danger,
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
      onClick: () => {
        action(() => {
          element.setVisible(false);
          element.remove();
        })();
      },
    },
  ];
}

export function EdgeContextMenu(props: {
  element: Edge<
    ElementModel,
    {
      tag: string;
      tagStatus: EdgeStatus;
      endTerminalStatus: string;
    }
  >;
}) {
  const { element } = props;
  const data = element.getData() as { tagStatus: string };
  const setModified = useSetVisualizerModified();

  const items = useEdgeMenuItems(element);

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
        onClick={() => {
          item?.onClick && item.onClick();
          setModified(true);
        }}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
