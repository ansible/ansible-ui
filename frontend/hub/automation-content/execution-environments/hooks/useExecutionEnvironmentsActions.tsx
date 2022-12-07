import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function useExecutionEnvironmentsActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add execution environment'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  );
}
