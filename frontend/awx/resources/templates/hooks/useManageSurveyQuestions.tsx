import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../../../../framework/components/useManagedItems';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Spec, Survey } from '../../../interfaces/Survey';
import { useParams } from 'react-router-dom';
import { usePostRequest } from '../../../../common/crud/usePostRequest';

export function useManageSurveyQuestions() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const postRequest = usePostRequest();
  const endpoint = awxAPI`/job_templates/${params.id?.toString() ?? ''}/survey_spec/`;
  const columns = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (spec: Spec) => spec.question_name,
      },
      {
        header: t('Defaults'),
        cell: (spec: Spec) => spec.default,
      },
    ],
    [t]
  );

  const { data, refresh } = useGet<Survey>(endpoint);
  const { openManageItems: openManageQuestionOrder } = useManageItems({
    id: `survey-question-template-${params.id}`,
    title: 'Manage question order',
    description: t('To reorder the survey questions drag and drop them in the desired location.'),
    items: data?.spec ?? [],
    keyFn: (spec: Spec) => spec.question_name,
    columns,
    hideSelection: true,
    onSubmit: (items) => {
      void (async () => {
        void (await postRequest(endpoint, {
          ...data,
          spec: items,
        }));
        refresh();
      })();
    },
  });

  return useMemo(
    () => ({
      openManageQuestionOrder,
    }),
    [openManageQuestionOrder]
  );
}
