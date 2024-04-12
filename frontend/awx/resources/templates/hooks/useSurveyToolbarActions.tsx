import { useMemo } from 'react';
import { useMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon, CogIcon } from '@patternfly/react-icons';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeleteSurveyDialog } from './useDeleteSurveyDialog';
import type { ISurveyView } from './useSurveyView';
import type { Spec } from '../../../interfaces/Survey';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { useManageSurveyQuestions } from './useManageSurveyQuestions';
import type { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';

export function useSurveyToolbarActions(view: ISurveyView) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { id } = useParams<{ id: string }>();
  const { openManageQuestionOrder } = useManageSurveyQuestions();
  const deleteQuestions = useDeleteSurveyDialog(view.unselectItemsAndRefresh);

  const jobTemplateSurvey = useMatch('/templates/job_template/:id/survey')?.params?.id?.toString();
  const workflowTemplateSurvey = useMatch(
    '/templates/workflow_job_template/:id/survey'
  )?.params?.id?.toString();

  const { data: options } = useOptions<OptionsResponse<ActionsResponse>>(
    jobTemplateSurvey
      ? awxAPI`/job_templates/${jobTemplateSurvey}/`
      : workflowTemplateSurvey
        ? awxAPI`/workflow_job_templates/${workflowTemplateSurvey}/`
        : ''
  );
  const canModifySurvey = Boolean(options && options.actions && options.actions['PUT']);

  return useMemo<IPageAction<Spec>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create question'),
        isDisabled: canModifySurvey
          ? undefined
          : t(
              'You do not have permission to create a question. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(
            jobTemplateSurvey
              ? AwxRoute.AddJobTemplateSurvey
              : AwxRoute.AddWorkflowJobTemplateSurvey,
            {
              params: { id },
            }
          );
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: CogIcon,
        label: t('Manage question order'),
        onClick: openManageQuestionOrder,
        isDisabled: canModifySurvey
          ? undefined
          : t(
              'You do not have permission to reorder questions. Please contact your system administrator if there is an issue with your access.'
            ),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected questions'),
        onClick: deleteQuestions,
        isDanger: true,
        isDisabled: canModifySurvey
          ? undefined
          : t(
              'You do not have permission to delete questions. Please contact your system administrator if there is an issue with your access.'
            ),
      },
    ],
    [
      t,
      openManageQuestionOrder,
      deleteQuestions,
      canModifySurvey,
      id,
      pageNavigate,
      jobTemplateSurvey,
    ]
  );
}
