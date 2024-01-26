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
import { EdgeStatus } from '../types';
import { useViewOptions } from '../ViewOptionsProvider';
interface MenuItem {
  key: string;
  status?: EdgeStatus;
  label: string;
  icon?: ReactElement;
  isDanger?: boolean;
  onClick?: (data: {
    tag: string;
    tagStatus: EdgeStatus;
    endTerminalStatus: string;
    originalStatus: string;
  }) => void;
}

export function useEdgeMenuItems(
  element: Edge<
    ElementModel,
    {
      tag: string;
      tagStatus: EdgeStatus;
      endTerminalStatus: string;
      originalStatus: string;
    }
  >
): MenuItem[] {
  const { t } = useTranslation();
  const { removeLink } = useViewOptions();
  return [
    {
      key: 'success',
      status: EdgeStatus.success,
      icon: (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      ),
      label: t('Run on success'),
      onClick: (data) => {
        action(() => {
          element.setData({
            ...data,
            tag: t('Run on success'),
            tagStatus: EdgeStatus.success,
            endTerminalStatus: 'success',
          });
          if ('success' === data.originalStatus) {
            element.setState({ modified: false });
            element.getSource().setState({ modified: false });
          } else {
            element.setState({ modified: true });
            element.getSource().setState({ modified: true });
          }
        })();
      },
    },
    {
      key: 'always',
      status: EdgeStatus.info,
      icon: (
        <Icon status="info">
          <CircleIcon />
        </Icon>
      ),
      label: t('Run always'),
      onClick: (data) => {
        action(() => {
          element.setData({
            ...data,
            tag: t('Run always'),
            tagStatus: EdgeStatus.info,
            endTerminalStatus: 'info',
          });
          if ('info' === data.originalStatus) {
            element.setState({ modified: false });
            element.getSource().setState({ modified: false });
          } else {
            element.setState({ modified: true });
            element.getSource().setState({ modified: true });
          }
        })();
      },
    },
    {
      key: 'fail',
      status: EdgeStatus.danger,
      icon: (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      ),
      label: t('Run on fail'),
      onClick: (data) => {
        action(() => {
          element.setData({
            ...data,
            tag: t('Run on fail'),
            tagStatus: EdgeStatus.danger,
            endTerminalStatus: 'fail',
          });
          if ('danger' === data.originalStatus) {
            element.setState({ modified: false });
            element.getSource().setState({ modified: false });
          } else {
            element.getSource().setState({ modified: true });
            element.setState({ modified: true });
          }
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
        removeLink(element);
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
      originalStatus: string;
    }
  >;
}) {
  const { element } = props;
  const data = element.getData();

  const items = useEdgeMenuItems(element);

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
          item?.onClick && data && item.onClick(data);
        }}
      >
        {item.label}
      </ContextMenuItem>
    );
  });
}
