import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon, CogIcon } from '@patternfly/react-icons';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import type { Spec } from '../../../interfaces/Survey';
import { useManageSurveyQuestions } from './useManageSurveyQuestions';

export function useSurveyToolbarActions() {
  const { t } = useTranslation();

  const { openManageQuestionOrder } = useManageSurveyQuestions();
  return useMemo<IPageAction<Spec>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create question'),
        onClick: () => alert('TODO'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: CogIcon,
        label: t('Manage question order'),
        onClick: openManageQuestionOrder,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected questions'),
        onClick: () => alert('TODO'),
        isDanger: true,
      },
    ],
    [openManageQuestionOrder, t]
  );
}
