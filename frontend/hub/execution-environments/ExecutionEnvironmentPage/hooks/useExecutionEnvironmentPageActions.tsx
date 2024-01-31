import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../../main/HubRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';

export function useExecutionEnvironmentPageActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  return useMemo(() => {
    const actions: IPageAction<ExecutionEnvironment>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit'),
        onClick: (ee) =>
          pageNavigate(HubRoute.EditExecutionEnvironment, { params: { id: ee?.name } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Use in controller'),
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Delete'),
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sign'),
        onClick: () => {},
      },
    ];
    return actions;
  }, [pageNavigate, t]);
}
