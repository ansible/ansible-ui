import { PageFormSelect, PageFormTextArea, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Spec, Survey } from '../interfaces/Survey';
import { WizardFormValues } from '../resources/templates/WorkflowVisualizer/types';
import { awxAPI } from './api/awx-utils';

function getJobType(resource: WizardFormValues['resource']) {
  if (!resource) return;

  if ('type' in resource) {
    if (resource?.type === 'job_template') {
      return 'job_templates';
    } else if (resource?.type === 'workflow_job_template') {
      return 'workflow_job_templates';
    }
  }

  if ('unified_job_type' in resource) {
    if (resource?.unified_job_type === 'job') {
      return 'job_templates';
    } else if (resource?.unified_job_type === 'workflow_job') {
      return 'workflow_job_templates';
    }
  }
}

export function SurveyStep({
  templateId,
  jobType,
  singleColumn,
}: {
  templateId?: string;
  jobType?: string;
  singleColumn?: boolean;
}) {
  const { t } = useTranslation();
  const { wizardData, stepData } = usePageWizard();
  const { reset } = useFormContext();

  let { resource } = wizardData as WizardFormValues;
  if (!resource && stepData?.nodePromptsStep) {
    resource = (stepData?.nodePromptsStep as WizardFormValues).resource;
  }
  const id = resource ? resource?.id?.toString() : templateId ? templateId : '';

  jobType = jobType ?? getJobType(resource);

  const { data: survey_spec } = useGet<Survey>(
    awxAPI`/${jobType ?? 'job_templates'}/${id}/survey_spec/`
  );

  useEffect(() => {
    const survey: { [key: string]: string | string[] | number } = {};
    const surveyStep = stepData.survey as {
      survey: {
        [key: string]: string | number | string[];
      };
    };

    survey_spec?.spec?.forEach((obj: Spec) => {
      const surveyVariable = surveyStep?.survey?.[obj?.variable];

      if (surveyVariable) {
        survey[obj.variable] = surveyVariable;
        return;
      }
      if (obj.default === '') {
        return;
      }
      if (obj.type === 'multiselect') {
        const specDefault = obj.default as string;
        survey[obj.variable] = specDefault.split('\n');
        return;
      }
      survey[obj.variable] = obj.default;
    });

    reset({ survey });
  }, [survey_spec, reset, stepData]);

  const getChoices = (name: string): PageSelectOption<string>[] => {
    const choices: PageSelectOption<string>[] = [];
    survey_spec?.spec.forEach((element: Spec) => {
      if (element.type === 'multiplechoice' || element.type === 'multiselect') {
        let choicesArray: string[] = [];

        if (Array.isArray(element.choices)) {
          choicesArray = element.choices;
        } else if (typeof element.choices === 'string') {
          choicesArray = element.choices.split('\n');
        }

        if (element.question_name === name) {
          choicesArray?.forEach((choice: string) => {
            choices.push({ value: choice, label: t(choice) });
          });
        }
      }
    });
    return choices;
  };

  return (
    <PageFormSection singleColumn={singleColumn}>
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
            key={index}
            name={`survey.${element.variable}`}
            placeholderText={t('Select option')}
            label={t(element.question_name)}
            labelHelp={element.question_description}
            labelHelpTitle=""
            options={getChoices(element.question_name)}
            isRequired={element.required}
          ></PageFormSelect>
        ) : element.type === 'multiselect' ? (
          <PageFormMultiSelect
            key={index}
            name={`survey.${element.variable}`}
            placeholder={t('Select option(s)')}
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
