import { ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { IAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useRunHealthCheck } from './useRunHealthCheck';

export function useInstanceToolbarActions(view: IAwxView<Instance>) {
  const { t } = useTranslation();
  const runHealthCheck = useRunHealthCheck(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instances) => runHealthCheck(instances),
      },
    ],
    [runHealthCheck, t]
  );
}
