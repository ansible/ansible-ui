import { ReactElement } from 'react';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  Edge,
  ElementModel,
  action,
  useVisualizationController,
} from '@patternfly/react-topology';
import {
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ControllerState, EdgeStatus } from '../types';
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

  const controller = useVisualizationController();
  const handleModified = action((modified: boolean) => {
    if (modified) {
      element.setState({ modified: true });
      element.getSource().setState({ modified: true });
      controller.setState({ ...controller.getState<ControllerState>(), modified: true });
    } else {
      element.setState({ modified: false });
      element.getSource().setState({ modified: false });
    }
  });
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
          handleModified('success' !== data.originalStatus);
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
          handleModified('info' !== data.originalStatus);
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
          handleModified('danger' !== data.originalStatus);
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
