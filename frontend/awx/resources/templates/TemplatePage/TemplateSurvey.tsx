import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { requestPatch } from '@ansible/common-ui/crud/Data';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { ButtonVariant, Switch } from '@patternfly/react-core';
import { CubesIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';

import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { Spec } from '../../../interfaces/Survey';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import styled from 'styled-components';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteSurveyDialog } from '../hooks/useDeleteSurveyDialog';
import { useSurveyColumns } from '../hooks/useSurveyColumns';
import { useSurveyToolbarActions } from '../hooks/useSurveyToolbarActions';
import { useSurveyView } from '../hooks/useSurveyView';

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
  const getPageUrl = useGetPageUrl();

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
  const toolbarActions = useSurveyToolbarActions(view, template.type);
  const deleteQuestions = useDeleteSurveyDialog(view.unselectItemsAndRefresh, template.type);

  const rowActions = useMemo<IPageAction<Spec>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit survey question'),
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
        label: t('Delete survey question'),
        isDisabled: () =>
          canDeleteSurvey ? undefined : t('You do not have permission to delete this question.'),
        onClick: (question) => deleteQuestions([question]),
        isDanger: true,
      },
    ],
    [t, canCreateSurvey, canDeleteSurvey, deleteQuestions, pageNavigate, template.id, template.type]
  );

  const templateUrl =
    template.type === 'job_template'
      ? AwxRoute.AddJobTemplateSurvey
      : AwxRoute.AddWorkflowJobTemplateSurvey;

  return (
    <PageTable<Spec>
      id="awx-survey-table"
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading survey')}
      emptyState={
        canCreateSurvey ? (
          <PageTableEmptyState
            title={t('There are currently no survey questions.')}
            description={t('Create a survey question to populate this list.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(templateUrl, { params: { id: template.id.toString() } })}
            >
              {t('Create survey question')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={t('No survey questions found')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      {...view}
      toolbarContent={
        <SurveySwitch
          label={t('Survey enabled')}
          id="survey-switch"
          data-cy="survey-switch"
          data-testid="survey-switch"
          aria-label="Survey enabled"
          hasCheckIcon
          isChecked={template.survey_enabled ?? false}
          onChange={(_, enabled) => void onToggleSurvey(enabled)}
        />
      }
    />
  );
}
