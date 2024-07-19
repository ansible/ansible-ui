import { useMemo } from 'react';
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
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function useSurveyToolbarActions(
  view: ISurveyView,
  templateType: (JobTemplate | WorkflowJobTemplate)['type']
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { id } = useParams<{ id: string }>();
  const deleteQuestions = useDeleteSurveyDialog(view.unselectItemsAndRefresh, templateType);

  const isJobTemplate = templateType === 'job_template';

  const { openManageQuestionOrder } = useManageSurveyQuestions(isJobTemplate);

  const { data: options } = useOptions<OptionsResponse<ActionsResponse>>(
    id
      ? awxAPI`/${isJobTemplate ? 'job_templates' : 'workflow_job_templates'}/${id.toString()}/`
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
        label: t('Create survey question'),
        isDisabled: canModifySurvey
          ? undefined
          : t(
              'You do not have permission to create a question. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(
            isJobTemplate ? AwxRoute.AddJobTemplateSurvey : AwxRoute.AddWorkflowJobTemplateSurvey,
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
        label: t('Delete survey questions'),
        onClick: deleteQuestions,
        isDanger: true,
        isDisabled: canModifySurvey
          ? undefined
          : t(
              'You do not have permission to delete survey questions. Please contact your system administrator if there is an issue with your access.'
            ),
      },
    ],
    [t, openManageQuestionOrder, deleteQuestions, canModifySurvey, id, pageNavigate, isJobTemplate]
  );
}
