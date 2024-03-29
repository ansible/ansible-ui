import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextArea, PageFormTextInput } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { Spec, Survey } from '../../../interfaces/Survey';
import { PageSelectOption } from '../../../../../framework/PageInputs/PageSelectOption';
import { PageFormCreatableSelect } from '../../../../../framework/PageForm/Inputs/PageFormCreatableSelect';

export function ScheduleSurveyStep() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const { unified_job_template_object } = wizardData as LaunchConfiguration;
  const { data: survey_spec } = useGet<Survey>(
    awxAPI`/job_templates/${unified_job_template_object.id.toString()}/survey_spec/`
  );

  const choicesTo: PageSelectOption<string>[] = [];
  survey_spec?.spec.map((element: Spec) => {
    if (element.type === 'multiplechoice') {
      element.choices?.map((choice: string) => {
        choicesTo.push({ value: choice, label: t(choice) });
      });
    }
  });

  return (
    <PageFormSection>
      {survey_spec?.spec.map((element, index) =>
        element.type === 'text' ? (
          <PageFormTextInput
            key={index}
            name={t(element.question_name)}
            label={t(element.question_name)}
            isRequired={element.required}
            type="text"
            maxLength={element.max}
            minLength={element.min}
          />
        ) : element.type === 'integer' ? (
          <PageFormTextInput
            key={index}
            name={t(element.question_name)}
            label={t(element.question_name)}
            isRequired={element.required}
            type="number"
            max={element.max}
            min={element.min}
          />
        ) : element.type === 'float' ? (
          <PageFormTextInput
            key={index}
            name={t(element.question_name)}
            label={t(element.question_name)}
            isRequired={element.required}
            type="number"
            max={element.max}
            min={element.min}
          />
        ) : element.type === 'password' ? (
          <PageFormTextInput
            key={index}
            name={t(element.question_name)}
            label={t(element.question_name)}
            isRequired={element.required}
            type="password"
            maxLength={element.max}
            minLength={element.min}
          />
        ) : element.type === 'textarea' ? (
          <PageFormTextArea
            key={index}
            name={t(element.question_name)}
            label={t(element.question_name)}
            isRequired={element.required}
            maxLength={element.max}
            minLength={element.min}
          ></PageFormTextArea>
        ) : element.type === 'multiplechoice' ? (
          <PageFormSelect
            name={t(element.question_name)}
            placeholderText={t('Select option')}
            label={t(element.question_name)}
            options={choicesTo}
            isRequired={element.required}
          ></PageFormSelect>
        ) : element.type === 'multiselect' ? (
          <PageFormCreatableSelect
            name={t(element.question_name)}
            placeholderText={t('Select option(s)')}
            label={t(element.question_name)}
            options={choicesTo}
            isRequired={element.required}
          />
        ) : undefined
      )}
    </PageFormSection>
  );
}
