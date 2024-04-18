import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextArea, PageFormTextInput } from '../../../framework';
import { usePageWizard } from '../../../framework/PageWizard/PageWizardProvider';
import { useGet } from '../../common/crud/useGet';
import { awxAPI } from './api/awx-utils';
import { Spec, Survey } from '../interfaces/Survey';
import { PageSelectOption } from '../../../framework/PageInputs/PageSelectOption';
import { PageFormCreatableSelect } from '../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { WizardFormValues } from '../resources/templates/WorkflowVisualizer/types';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function SurveyStep({ templateId, jobType }: { templateId?: string; jobType?: string }) {
  const { t } = useTranslation();
  const { wizardData, setStepData } = usePageWizard();
  const { reset } = useFormContext();
  const { node_resource } = wizardData as WizardFormValues;
  const id = node_resource ? node_resource.id.toString() : templateId ? templateId : '';
  const { data: survey_spec } = useGet<Survey>(
    awxAPI`/${jobType ?? 'job_templates'}/${id}/survey_spec/`
  );

  useEffect(() => {
    const survey: { [key: string]: string | number | { name: string | number }[] } = {};
    survey_spec?.spec?.forEach((obj) => {
      if (obj.type === 'multiselect') {
        survey[obj.variable] = [{ name: obj.default }];
        return;
      }
      survey[obj.variable] = obj.default;
    });
    setStepData((prev) => ({
      ...prev,
      survey,
    }));
    reset({ survey });
  }, [reset, setStepData, survey_spec, wizardData]);

  const getChoices = (name: string): PageSelectOption<string>[] => {
    const choices: PageSelectOption<string>[] = [];

    survey_spec?.spec.forEach((element: Spec) => {
      if (
        (element.type === 'multiplechoice' || element.type === 'multiselect') &&
        Array.isArray(element.choices)
      ) {
        if (element.question_name === name) {
          element.choices?.forEach((choice: string) => {
            choices.push({ value: choice, label: t(choice) });
          });
        }
      }
    });
    return choices;
  };

  return (
    <PageFormSection>
      {survey_spec?.spec.map((element, index) =>
        element.type === 'text' ? (
          <PageFormTextInput
            key={index}
            name={`survey.${element.variable}`}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            isRequired={element.required}
            type="text"
            maxLength={element.max}
            minLength={element.min}
          />
        ) : element.type === 'integer' ? (
          <PageFormTextInput
            key={index}
            name={`survey.${element.variable}`}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            isRequired={element.required}
            type="number"
            max={element.max}
            min={element.min}
          />
        ) : element.type === 'float' ? (
          <PageFormTextInput
            key={index}
            name={`survey.${element.variable}`}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            isRequired={element.required}
            type="number"
            max={element.max}
            min={element.min}
          />
        ) : element.type === 'password' ? (
          <PageFormTextInput
            key={index}
            name={`survey.${element.variable}`}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            isRequired={element.required}
            type="password"
            maxLength={element.max}
            minLength={element.min}
          />
        ) : element.type === 'textarea' ? (
          <PageFormTextArea
            key={index}
            name={`survey.${element.variable}`}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            isRequired={element.required}
            maxLength={element.max}
            minLength={element.min}
          ></PageFormTextArea>
        ) : element.type === 'multiplechoice' ? (
          <PageFormSelect
            name={`survey.${element.variable}`}
            placeholderText={t('Select option')}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            options={getChoices(element.question_name)}
            isRequired={element.required}
          ></PageFormSelect>
        ) : element.type === 'multiselect' ? (
          <PageFormCreatableSelect
            name={`survey.${element.variable}`}
            placeholderText={t('Select option(s)')}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            options={getChoices(element.question_name)}
            isRequired={element.required}
          />
        ) : undefined
      )}
    </PageFormSection>
  );
}
