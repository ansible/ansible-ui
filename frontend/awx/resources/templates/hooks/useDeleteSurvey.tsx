import { useCallback } from 'react';
import { useMatch } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeleteRequest } from '../../../../common/crud/useDeleteRequest';
import { useGet } from '../../../../common/crud/useGet';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import type { Spec, Survey } from '../../../interfaces/Survey';

export function useDeleteSurvey(props: {
  onClose: () => void;
  onComplete: (questions: Spec[]) => void;
  onError: (err: unknown) => void;
}) {
  const { onClose, onComplete, onError } = props;
  const postRequest = usePostRequest();
  const deleteRequest = useDeleteRequest();

  const jobTemplateSurveyId = useMatch(
    '/templates/job_template/:id/survey'
  )?.params?.id?.toString();
  const workflowTemplateSurveyId = useMatch(
    '/templates/workflow_job_template/:id/survey'
  )?.params?.id?.toString();

  const surveySpecEndpoint = jobTemplateSurveyId
    ? awxAPI`/job_templates/${jobTemplateSurveyId}/survey_spec/`
    : workflowTemplateSurveyId
      ? awxAPI`/workflow_job_templates/${workflowTemplateSurveyId}/survey_spec/`
      : '';

  const { data } = useGet<Survey>(surveySpecEndpoint);

  return useCallback(
    async (surveyQuestions: Spec[]) => {
      try {
        if (data) {
          const updatedSurvey = {
            name: data?.name,
            description: data?.description,
            spec: data?.spec?.filter((q) => !surveyQuestions.includes(q)),
          };

          if (surveyQuestions.length === data.spec?.length) {
            await deleteRequest(surveySpecEndpoint);
          } else {
            await postRequest(surveySpecEndpoint, updatedSurvey);
          }
        }
      } catch (error) {
        onError(error);
      } finally {
        onComplete(surveyQuestions);
        onClose();
      }
    },
    [data, deleteRequest, onError, postRequest, onClose, onComplete, surveySpecEndpoint]
  );
}
