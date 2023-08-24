import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { User } from '../../../interfaces/User';

export function useAccessListToolbarAction(
  onComplete: (schedules: User[]) => void,
  sublistEndPoint: string
) {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(sublistEndPoint);
  const canGrantAcess = Boolean(data && data.actions && data.actions['POST']);

  const AccessListToolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add'),
        isDisabled: canGrantAcess
          ? undefined
          : t('You do not have permission to give access to this resource.'),
        href: '/',
      },
    ],
    [canGrantAcess, t]
  );

  return AccessListToolbarActions;
}
