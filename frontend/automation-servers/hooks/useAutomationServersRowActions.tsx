import { MinusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../framework';
import { AutomationServer } from '../AutomationServer';
import { useRemoveAutomationServers } from './useRemoveAutomationServers';

export function useAutomationServersRowActions() {
  const { t } = useTranslation();
  const removeAutomationServers = useRemoveAutomationServers();
  return useMemo<IPageAction<AutomationServer>[]>(
    () => [
      // {
      //   type: TypedActionType.single,
      //   variant: ButtonVariant.primary,
      //   icon: EditIcon,
      //   label: t('Edit automation server'),
      //   onClick: () => null,
      // },
      // { type: TypedActionType.seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: (server) => removeAutomationServers([server]),
      },
    ],
    [removeAutomationServers, t]
  );
}
