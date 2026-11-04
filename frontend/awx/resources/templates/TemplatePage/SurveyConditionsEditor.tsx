import { PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { AddCircleOIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { conditionValueToText, textToConditionValue } from '../../../common/surveyConditions';
import { Spec, SurveyCondition } from '../../../interfaces/Survey';

/** Shape of a condition row while it is edited in the survey question form. */
export interface ConditionFormValue {
  variable: string;
  operator: SurveyCondition['operator'];
  value: string;
}

/** Form values for the condition, category and page fields of a survey question. */
export interface ConditionalFormValues {
  category: string;
  page: number;
  conditions: ConditionFormValue[];
  condition_logic: 'and' | 'or';
}

/** Initial editor values for the condition, category and page fields of a question. */
export function getConditionalFormValues(question: Spec | undefined): ConditionalFormValues {
  return {
    category: question?.category ?? '',
    page: question?.page ?? 1,
    conditions: (question?.conditions ?? []).map((c) => ({
      variable: c.variable,
      operator: c.operator,
      value: conditionValueToText(c.value),
    })),
    condition_logic: question?.condition_logic ?? 'and',
  };
}

/**
 * Convert the editor values back into the optional spec fields. Fields that are empty
 * are left out, so questions without conditions keep the plain survey spec shape.
 */
export function toConditionalSpecFields(
  values: Partial<{
    category: string;
    page: number | string;
    conditions: { variable: string; operator: SurveyCondition['operator']; value?: unknown }[];
    condition_logic: 'and' | 'or';
  }>
): Pick<Spec, 'category' | 'page' | 'conditions' | 'condition_logic'> {
  const fields: Pick<Spec, 'category' | 'page' | 'conditions' | 'condition_logic'> = {
    category: values.category || undefined,
    page: values.page ? Number(values.page) : undefined,
  };
  const conditions = (values.conditions ?? [])
    .filter((c) => c.variable && c.operator)
    .map((c) => ({
      variable: c.variable,
      operator: c.operator,
      value: textToConditionValue(c.operator, typeof c.value === 'string' ? c.value : undefined),
    }));
  if (conditions.length > 0) {
    fields.conditions = conditions;
    fields.condition_logic = values.condition_logic ?? 'and';
  }
  return fields;
}

export function SurveyConditions({ otherVariables }: Readonly<{ otherVariables: string[] }>) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ name: 'conditions' });

  return (
    <PageFormSection title={t('Conditions')} singleColumn>
      {fields.length > 1 && (
        <PageFormSelect
          name="condition_logic"
          id="condition-logic"
          label={t('Match conditions')}
          options={[
            { value: 'and', label: t('All conditions must match (AND)') },
            { value: 'or', label: t('Any condition can match (OR)') },
          ]}
          labelHelp={t`Whether all or any of the conditions must be met for this question to be shown.`}
        />
      )}

      {fields.map((field, index) => (
        <SurveyConditionRow
          key={field.id}
          index={index}
          otherVariables={otherVariables}
          onRemove={() => remove(index)}
        />
      ))}

      <Button
        type="button"
        variant="link"
        icon={<AddCircleOIcon />}
        onClick={() => append({ variable: '', operator: 'eq', value: '' })}
      >
        {t('Add condition')}
      </Button>
    </PageFormSection>
  );
}

/** Operator options for survey question conditions, with translated labels. */
function useConditionOperatorOptions(): { value: SurveyCondition['operator']; label: string }[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { value: 'eq', label: t('Equals (eq)') },
      { value: 'neq', label: t('Not equals (neq)') },
      { value: 'in', label: t('In list (in)') },
      { value: 'notin', label: t('Not in list (notin)') },
      { value: 'gt', label: t('Greater than (gt)') },
      { value: 'lt', label: t('Less than (lt)') },
      { value: 'gte', label: t('Greater or equal (gte)') },
      { value: 'lte', label: t('Less or equal (lte)') },
      { value: 'is_set', label: t('Is set') },
      { value: 'is_not_set', label: t('Is not set') },
    ],
    [t]
  );
}

function SurveyConditionRow(
  props: Readonly<{ index: number; otherVariables: string[]; onRemove: () => void }>
) {
  const { index, otherVariables, onRemove } = props;
  const { t } = useTranslation();
  const operator = useWatch({ name: `conditions.${index}.operator` }) as string;
  const operatorOptions = useConditionOperatorOptions();
  const variableOptions = useMemo(
    () => otherVariables.map((v) => ({ value: v, label: v })),
    [otherVariables]
  );
  const needsValue = operator !== 'is_set' && operator !== 'is_not_set';
  const isListOperator = operator === 'in' || operator === 'notin';

  return (
    <PageFormGroup label={t('Only show when')}>
      <Flex alignItems={{ default: 'alignItemsFlexEnd' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem grow={{ default: 'grow' }}>
          <PageFormSelect
            name={`conditions.${index}.variable`}
            id={`condition-variable-${index}`}
            label={t('Variable')}
            placeholderText={t('Select variable')}
            options={variableOptions}
            isRequired
          />
        </FlexItem>
        <FlexItem grow={{ default: 'grow' }}>
          <PageFormSelect
            name={`conditions.${index}.operator`}
            id={`condition-operator-${index}`}
            label={t('Operator')}
            placeholderText={t('Select operator')}
            options={operatorOptions}
            isRequired
          />
        </FlexItem>
        {needsValue && (
          <FlexItem grow={{ default: 'grow' }}>
            <PageFormTextInput
              id={`condition-value-${index}`}
              name={`conditions.${index}.value`}
              type="text"
              label={t`Value`}
              placeholder={
                isListOperator ? t('Enter values, separated by commas') : t('Enter expected value')
              }
            />
          </FlexItem>
        )}
        <FlexItem>
          <Button
            icon={<TrashIcon />}
            variant="plain"
            aria-label={t('Remove condition')}
            onClick={onRemove}
          />
        </FlexItem>
      </Flex>
    </PageFormGroup>
  );
}
