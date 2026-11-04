import type { Spec, SurveyCondition } from '../interfaces/Survey';

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

/**
 * Evaluate one condition against the current answers.
 *
 * Survey answers arrive as strings from the API (numbers only after the user edits an
 * integer/float field), so values are compared as strings on purpose. The numeric
 * operators parse both sides and fail closed when either side is not a number.
 * Multiselect answers are arrays: `eq`/`in` match when any selected value matches,
 * `neq`/`notin` match when none of the selected values match.
 */
export function evaluateSingleCondition(
  condition: SurveyCondition,
  data: Record<string, unknown>
): boolean {
  const { operator, value: expected } = condition;
  const actual = data[condition.variable];
  const present = isPresent(actual);

  if (operator === 'is_set') return present;
  if (operator === 'is_not_set') return !present;
  if (!present) return false;

  const actualValues = toStringList(actual);

  switch (operator) {
    case 'eq':
      return actualValues.includes(String(expected));
    case 'neq':
      return !actualValues.includes(String(expected));
    case 'in': {
      const expectedValues = toStringList(expected);
      return actualValues.some((v) => expectedValues.includes(v));
    }
    case 'notin': {
      const expectedValues = toStringList(expected);
      return !actualValues.some((v) => expectedValues.includes(v));
    }
    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      if (Array.isArray(actual)) return false;
      const a = parseFloat(String(actual));
      const b = parseFloat(String(expected));
      if (isNaN(a) || isNaN(b)) return false;
      if (operator === 'gt') return a > b;
      if (operator === 'lt') return a < b;
      if (operator === 'gte') return a >= b;
      return a <= b;
    }
    default:
      return false;
  }
}

/**
 * Whether a survey question should be shown. Questions without conditions are always
 * shown; otherwise the conditions are combined with `condition_logic` (default `and`).
 */
export function evaluateConditions(element: Spec, data: Record<string, unknown>): boolean {
  const conditions = element.conditions;
  if (!conditions || conditions.length === 0) return true;

  const logic = element.condition_logic ?? 'and';
  const results = conditions.map((c) => evaluateSingleCondition(c, data));

  return logic === 'or' ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Remove survey answers whose spec conditions are not met.
 *
 * The survey form seeds a default value for every spec field regardless of its
 * conditions, so conditionally-hidden fields still carry their default in the
 * form data. Before that data is shown in the review step or submitted, drop the
 * entries for fields whose conditions evaluate to false, so only the fields the
 * user actually saw are included.
 *
 * Conditions are evaluated against the full answer set (the survey values merged
 * over any additional context such as extra vars), matching the visibility logic
 * used while rendering the survey.
 */
export function pruneSurveyByConditions<T = unknown>(
  survey: Readonly<Record<string, T>>,
  spec: readonly Spec[] | undefined,
  context: Readonly<Record<string, unknown>> = {}
): Record<string, T> {
  if (!spec || spec.length === 0) return { ...survey };

  const data: Record<string, unknown> = { ...context, ...survey };
  const hidden = new Set(
    spec.filter((element) => !evaluateConditions(element, data)).map((element) => element.variable)
  );

  return Object.fromEntries(
    Object.entries(survey).filter(([variable]) => !hidden.has(variable))
  ) as Record<string, T>;
}

const LIST_OPERATORS: SurveyCondition['operator'][] = ['in', 'notin'];
const VALUELESS_OPERATORS: SurveyCondition['operator'][] = ['is_set', 'is_not_set'];

/** Convert a stored condition value into the text shown in the question editor. */
export function conditionValueToText(value: SurveyCondition['value']): string {
  if (value === undefined || value === null) return '';
  return Array.isArray(value) ? value.join(', ') : String(value);
}

/**
 * Convert the editor text back into a stored condition value.
 * `in` / `notin` take a comma-separated list; `is_set` / `is_not_set` take no value.
 */
export function textToConditionValue(
  operator: SurveyCondition['operator'],
  text: string | undefined
): SurveyCondition['value'] {
  if (VALUELESS_OPERATORS.includes(operator)) return undefined;
  const trimmed = text?.trim() ?? '';
  if (trimmed === '') return undefined;
  if (LIST_OPERATORS.includes(operator)) {
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }
  return trimmed;
}
