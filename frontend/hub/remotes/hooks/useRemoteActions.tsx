import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { PlusIcon } from '@patternfly/react-icons';
import { ButtonVariant } from '@patternfly/react-core';
import { IRemotes } from '../Remotes';
import { RouteObj } from '../../../Routes';
import { useNavigate } from 'react-router-dom';

export function useRemoteActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actions = useMemo<IPageAction<IRemotes>[]>(
    () => [
      {
        icon: PlusIcon,
        isPinned: true,
        label: t('Create remote'),
        onClick: () => navigate(RouteObj.CreateRemotes),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
    ],
    [t, navigate]
  );

  return actions;
}
