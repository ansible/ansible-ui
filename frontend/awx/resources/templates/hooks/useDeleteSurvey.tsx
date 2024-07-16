import { useCallback } from 'react';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeleteRequest } from '../../../../common/crud/useDeleteRequest';
import { useGet } from '../../../../common/crud/useGet';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import type { Spec, Survey } from '../../../interfaces/Survey';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function useDeleteSurvey(props: {
  onClose: () => void;
  onComplete: (questions: Spec[]) => void;
  onError: (err: unknown) => void;
  id?: string;
  templateType?: (JobTemplate | WorkflowJobTemplate)['type'];
}) {
  const { onClose, onComplete, onError, id, templateType } = props;
  const postRequest = usePostRequest();
  const deleteRequest = useDeleteRequest();

  const surveySpecEndpoint = id
    ? awxAPI`/${templateType === 'job_template' ? 'job_templates' : 'workflow_job_templates'}/${id}/survey_spec/`
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
