import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Switch } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon, CubesIcon, PencilAltIcon } from '@patternfly/react-icons';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  usePageNavigate,
} from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGetItem } from '../../../../common/crud/useGet';
import { requestPatch } from '../../../../common/crud/Data';

import type { Spec } from '../../../interfaces/Survey';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

import { useDeleteSurveyDialog } from '../hooks/useDeleteSurveyDialog';
import { useSurveyView } from '../hooks/useSurveyView';
import { useSurveyColumns } from '../hooks/useSurveyColumns';
import { useSurveyToolbarActions } from '../hooks/useSurveyToolbarActions';
import styled from 'styled-components';
import { AwxRoute } from '../../../main/AwxRoutes';

const SurveySwitch = styled(Switch)`
  margin: 0 16px;
  align-self: center;
`;

export function TemplateSurvey({ resourceType }: { resourceType: string }) {
  const params = useParams<{ id: string }>();
  const { data: template, refresh } = useGetItem<JobTemplate | WorkflowJobTemplate>(
    awxAPI`/${resourceType}/`,
    params.id
  );

  const handleToggleSurvey = useCallback(
    async (enabled: boolean) => {
      if (!template) return;

      const url =
        template.type === 'job_template'
          ? awxAPI`/job_templates/${template.id.toString()}/`
          : awxAPI`/workflow_job_templates/${template.id.toString()}/`;

      await requestPatch(url, {
        survey_enabled: enabled,
      });

      refresh();
    },
    [template, refresh]
  );

  if (!template) {
    return null;
  }

  return <TemplateSurveyInternal template={template} onToggleSurvey={handleToggleSurvey} />;
}

export function TemplateSurveyInternal({
  template,
  onToggleSurvey,
}: {
  template: JobTemplate | WorkflowJobTemplate;
  onToggleSurvey: (enabled: boolean) => Promise<void>;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const view = useSurveyView({
    url:
      template.type === 'job_template'
        ? awxAPI`/job_templates/${template.id.toString()}/survey_spec/`
        : awxAPI`/workflow_job_templates/${template.id.toString()}/survey_spec/`,
  });

  const canCreateSurvey = template.summary_fields.user_capabilities.edit;
  const canDeleteSurvey = template.summary_fields.user_capabilities.delete;

  const tableColumns = useSurveyColumns({
    templateType: template.type,
    id: template.id.toString(),
  });
  const toolbarActions = useSurveyToolbarActions(view);
  const deleteQuestions = useDeleteSurveyDialog(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<Spec>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit question'),
        isDisabled: () =>
          canCreateSurvey ? undefined : t('You do not have permission to edit this question.'),
        onClick: (question) => {
          pageNavigate(
            template.type === 'job_template'
              ? AwxRoute.EditJobTemplateSurvey
              : AwxRoute.EditWorkflowJobTemplateSurvey,
            {
              params: { id: template.id.toString() },
              query: { question_variable: question.variable },
            }
          );
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete question'),
        isDisabled: () =>
          canDeleteSurvey ? undefined : t('You do not have permission to delete this question.'),
        onClick: (question) => deleteQuestions([question]),
        isDanger: true,
      },
    ],
    [t, canCreateSurvey, canDeleteSurvey, deleteQuestions, pageNavigate, template.id, template.type]
  );

  return (
    <PageTable<Spec>
      id="awx-survey-table"
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading survey')}
      emptyStateTitle={
        canCreateSurvey
          ? t('There are currently no survey questions.')
          : t('You do not have permission to create a survey.')
      }
      emptyStateDescription={
        canCreateSurvey
          ? t('Create a survey question by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateSurvey ? undefined : CubesIcon}
      emptyStateButtonText={canCreateSurvey ? t('Create survey question') : undefined}
      emptyStateButtonIcon={canCreateSurvey ? <PlusCircleIcon /> : undefined}
      emptyStateButtonClick={
        canCreateSurvey
          ? () => {
              pageNavigate(
                template.type === 'job_template'
                  ? AwxRoute.AddJobTemplateSurvey
                  : AwxRoute.AddWorkflowJobTemplateSurvey,
                {
                  params: { id: template.id.toString() },
                }
              );
            }
          : undefined
      }
      {...view}
      toolbarContent={
        <SurveySwitch
          label={t('Survey enabled')}
          labelOff={t('Survey disabled')}
          id="survey-switch"
          data-cy="survey-switch"
          aria-label="Survey enabled"
          hasCheckIcon
          isChecked={template.survey_enabled ?? false}
          onChange={(_, enabled) => void onToggleSurvey(enabled)}
        />
      }
    />
  );
}
