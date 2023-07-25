import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../framework';
import { AutomationServer } from '../AutomationServer';
import { useAddAutomationServer } from './useAddAutomationServer';

export function useAutomationServersToolbarActions() {
  const { t } = useTranslation();
  const addAutomationServer = useAddAutomationServer();
  // const removeAutomationServers = useRemoveAutomationServers();
  return useMemo<IPageAction<AutomationServer>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: addAutomationServer,
      },
      // {
      //   type: PageActionType.Button,
      // selection: PageActionSelection.Multiple,
      //   icon: MinusCircleIcon,
      //   label: t('Remove selected automation servers'),
      //   onClick: (servers) => removeAutomationServers(servers),
      // },
    ],
    [addAutomationServer, t]
  );
}
