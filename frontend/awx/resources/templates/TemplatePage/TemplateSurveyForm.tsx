import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../../common/AwxError';
import { AwxPageForm } from '../../../common/AwxPageForm';
import {
  ChoiceOption,
  MultipleChoiceField,
  MultipleChoiceFieldType,
} from '../../../common/MultipleChoiceField';
import { awxAPI } from '../../../common/api/awx-utils';
import { Spec, Survey } from '../../../interfaces/Survey';
import { AwxRoute } from '../../../main/AwxRoutes';

type ResourceType = 'job_templates' | 'workflow_job_templates';

const minDefault = 0;
const maxDefault = 1024;

export function EditTemplateSurveyForm({ resourceType }: { resourceType: ResourceType }) {
  const [searchParams] = useURLSearchParams();

  const questionVariable = searchParams.get('question_variable');

  return (
    <TemplateSurveyForm
      mode="edit"
      resourceType={resourceType}
      questionVariable={questionVariable}
    />
  );
}

export function AddTemplateSurveyForm({ resourceType }: { resourceType: ResourceType }) {
  return <TemplateSurveyForm mode="add" resourceType={resourceType} />;
}

interface IProps {
  resourceType: ResourceType;
  mode: 'add' | 'edit';
  questionVariable?: string | null;
}

interface FormSpec extends Spec {
  formattedChoices?: ChoiceOption[];
}

export function TemplateSurveyForm(props: IProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Survey>();

  const { resourceType, mode, questionVariable } = props;

  const pageNavigateSurveyRoute = () =>
    pageNavigate(
      resourceType === 'job_templates'
        ? AwxRoute.JobTemplateSurvey
        : AwxRoute.WorkflowJobTemplateSurvey,
      { params: { id } }
    );

  if (!questionVariable && mode !== 'add') pageNavigateSurveyRoute();

  const {
    error,
    data: survey,
    isLoading,
    refresh,
  } = useGet<Survey>(awxAPI`/${resourceType}/${id ?? ''}/survey_spec/`);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;

  if (isLoading) return <LoadingPage />;

  let question: Spec | undefined;
  if (mode === 'edit' && questionVariable) {
    question = survey?.spec.find((q) => q.variable === questionVariable);

    if (!question) pageNavigateSurveyRoute();
  }

  if (mode === 'edit' && !question) return null;

  const isMultiSelect = (type: string) => type === 'multiselect' || type === 'multiplechoice';

  const displayDuplicateError = (question: Spec, setError: (error: string) => void) => {
    setError(
      t(`Survey already contains a question with variable named "{{question}}".`, {
        question: question.variable,
      })
    );
  };

  let formattedChoices;
  if (question && isMultiSelect(question.type)) {
    const choices = Array.isArray(question.choices)
      ? question.choices
      : question.choices.split('\n');
    let defaults;
    if (Array.isArray(question?.default)) {
      defaults = question.default;
    } else if (question.default) {
      defaults = question.default.toString().split('\n');
    } else {
      defaults = null;
    }

    formattedChoices = choices?.map((c, i) => ({
      name: c,
      default: defaults?.includes(c) ?? false,
      id: i.toString(),
    }));
  }

  const initialValues: FormSpec = {
    question_name: question?.question_name || '',
    question_description: question?.question_description || '',
    required: question ? question?.required : true,
    type: question?.type ?? 'text',
    variable: question?.variable || '',
    min: question?.min || minDefault,
    max: question?.max || maxDefault,
    default: question?.default ?? '',
    choices: question?.choices ?? [],
    formattedChoices,
    new_question: !question,
  };

  const onSubmit: PageFormSubmitHandler<FormSpec & { 'add-choice'?: string }> = async (
    newQuestion,
    setError,
    setFieldError
  ) => {
    const updatedSurvey = {
      name: survey?.name ?? '',
      description: survey?.description ?? '',
      spec: survey?.spec ?? [],
    };

    if (
      ['multiplechoice', 'multiselect'].includes(newQuestion.type) &&
      !newQuestion.formattedChoices?.length
    ) {
      setFieldError('add-choice', {
        message: t`Multiple choices require at least one answer.`,
      });
      return;
    }

    const defaultValue = newQuestion.default
      ? newQuestion.type === 'integer'
        ? Number(newQuestion.default)
        : newQuestion.type === 'float'
          ? parseFloat(newQuestion.default.toString())
          : newQuestion?.default?.toString()
      : '';

    let question: Spec = {
      max: Number(newQuestion.max),
      min: Number(newQuestion.min),
      new_question: newQuestion.new_question,
      type: newQuestion.type,
      default: defaultValue,
      required: newQuestion.required,
      variable: newQuestion.variable,
      question_name: newQuestion.question_name,
      question_description: newQuestion.question_description,
      choices: newQuestion.choices,
    };

    const isDuplicate = updatedSurvey.spec.some((q) => q.variable === newQuestion.variable);

    let questions: Spec[];

    if (mode === 'add' && isDuplicate) {
      displayDuplicateError(question, setError);
      return;
    }

    if (Array.isArray(newQuestion.formattedChoices) && isMultiSelect(question.type)) {
      const choices = newQuestion.formattedChoices?.map((choice) => choice.name) ?? [];

      const defaults =
        newQuestion.formattedChoices
          ?.filter((choice) => choice.default)
          .map((choice) => choice.name)
          .join('\n') ?? '';

      question = { ...question, choices, default: defaults };
    }

    if (mode === 'add') {
      questions = [...updatedSurvey.spec, question];
    } else {
      questions = [...updatedSurvey.spec];

      const selectedQuestionIndex = questions.findIndex(
        (question) => question.variable === initialValues.variable
      );

      if (initialValues.variable !== question.variable && isDuplicate) {
        displayDuplicateError(question, setError);
        return;
      }

      if (selectedQuestionIndex === -1) {
        setError(t(`Survey question not found.`));
      }

      questions[selectedQuestionIndex] = question;
    }

    const postBody: Survey = {
      ...updatedSurvey,
      spec: questions,
    };

    try {
      await postRequest(awxAPI`/${resourceType}/${id ?? ''}/survey_spec/`, postBody);
      pageNavigateSurveyRoute();
    } catch (err) {
      setError(t`Failed to create new survey question.`);
    }
  };

  return (
    <AwxPageForm
      onSubmit={onSubmit}
      onCancel={() => pageNavigateSurveyRoute()}
      submitText={mode === 'add' ? t('Create survey question') : t('Save survey question')}
      defaultValue={initialValues}
      disableSubmitOnEnter
    >
      <TemplateSurveyInputs />
    </AwxPageForm>
  );
}

function TemplateSurveyInputs() {
  const { t } = useTranslation();

  const answerType = useWatch({ name: 'type' }) as string;

  return (
    <>
      <PageFormTextInput
        id="question-name"
        name="question_name"
        type="text"
        label={t`Question`}
        placeholder={t('Enter question')}
        isRequired
      />
      <PageFormTextInput
        id="question-description"
        name="question_description"
        type="text"
        label={t`Description`}
        placeholder={t('Enter description')}
      />
      <PageFormTextInput
        id="question-variable"
        name="variable"
        type="text"
        label={t`Answer variable name`}
        placeholder={t('Enter answer variable name')}
        validate={(variable: string) => {
          if (/\s/.test(variable)) {
            return t`This field must not contain spaces.`;
          }
          return undefined;
        }}
        isRequired
        labelHelp={t`The suggested format for variable names is lowercase and underscore-separated (for example, foo_bar, user_id, host_name, etc.). Variable names with spaces are not allowed.`}
      />

      <PageFormSelect
        name="type"
        id="question-type"
        data-cy="question-type"
        label={t('Answer type')}
        placeholderText={t('Select answer type')}
        options={[
          { value: 'text', label: t('Text') },
          { value: 'textarea', label: t('Textarea') },
          { value: 'password', label: t('Password') },
          { value: 'multiplechoice', label: t('Multiple Choice (single select)') },
          { value: 'multiselect', label: t('Multiple Choice (multiple select)') },
          { value: 'integer', label: t('Integer') },
          { value: 'float', label: t('Float') },
        ]}
        isRequired
        labelHelp={t`Choose an answer type or format you want as the prompt for the user. Refer to the Ansible Controller Documentation for more additional information about each option.`}
      />

      <PageFormGroup label={t('Options')}>
        <PageFormCheckbox
          id="question-required"
          data-cy="question-required"
          label={t`Required`}
          name="required"
        />
      </PageFormGroup>

      {answerType && <SelectedAnswerType answer={answerType} />}
    </>
  );
}

function SelectedAnswerType({ answer }: { answer: string }) {
  const { t } = useTranslation();

  const { setValue, reset, getFieldState } = useFormContext();

  useEffect(() => {
    const { isDirty } = getFieldState('type');
    if (isDirty) {
      setValue('min', minDefault);
      setValue('max', maxDefault);
      reset(undefined, { keepValues: true, keepErrors: false });
    }
  }, [answer, setValue, reset, getFieldState]);

  const min = Number(useWatch({ name: 'min' }));
  const max = Number(useWatch({ name: 'max' }));

  return (
    <PageFormSection>
      {['text', 'textarea', 'password'].includes(answer) && (
        <>
          <PageFormTextInput
            id="question-min"
            name="min"
            type="number"
            label={t`Minimum length`}
            placeholder={t('Enter minimum length')}
          />
          <PageFormTextInput
            id="question-max"
            name="max"
            type="number"
            label={t`Maximum length`}
            placeholder={t('Enter maximum legnth')}
          />
        </>
      )}
      {['integer', 'float'].includes(answer) && (
        <>
          <PageFormTextInput id="question-min" name="min" type="number" label={t`Minimum`} />
          <PageFormTextInput id="question-max" name="max" type="number" label={t`Maximum`} />
        </>
      )}
      {['text', 'integer', 'float'].includes(answer) && (
        <PageFormTextInput
          id="question-default"
          name="default"
          min={min}
          max={max}
          maxLength={max}
          minLength={min}
          type={answer === 'text' ? 'text' : 'number'}
          label={t`Default answer`}
          placeholder={t('Enter default answer')}
          validate={(value: string) => {
            if (answer === 'integer') {
              const num = parseFloat(value);
              if (!Number.isInteger(num) && /[^0-9]/.test(value)) {
                return t`This field must be an integer.`;
              }
              return undefined;
            }
          }}
        />
      )}
      {answer === 'textarea' && (
        <PageFormTextArea id="question-default" name="default" label={t`Default answer`} />
      )}
      {answer === 'password' && (
        <PageFormTextInput
          id="question-default"
          name="default"
          label={t`Default answer`}
          type="password"
        />
      )}
      {['multiplechoice', 'multiselect'].includes(answer) && (
        <MultipleChoiceField type={answer as MultipleChoiceFieldType} />
      )}
    </PageFormSection>
  );
}
