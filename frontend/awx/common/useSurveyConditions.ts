import type { Spec, SurveyCondition } from '../interfaces/Survey';

function evaluateSingleCondition(
  condition: SurveyCondition,
  data: Record<string, unknown>
): boolean {
  const variable = condition.variable;
  const operator = condition.operator;
  const expected = condition.value;
  const actual = data[variable];
  const isPresent = variable in data && actual !== undefined && actual !== null && actual !== '';

  if (operator === 'is_set') return isPresent;
  if (operator === 'is_not_set') return !isPresent;
  if (!isPresent) return false;

  const actualStr = String(actual);

  switch (operator) {
    case 'eq':
      return actualStr === String(expected);
    case 'neq':
      return actualStr !== String(expected);
    case 'in': {
      const list = Array.isArray(expected) ? expected : [expected];
      return list.map(String).includes(actualStr);
    }
    case 'notin': {
      const list = Array.isArray(expected) ? expected : [expected];
      return !list.map(String).includes(actualStr);
    }
    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      const a = parseFloat(actualStr);
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
  survey: Record<string, T>,
  spec: Spec[] | undefined,
  context: object = {}
): Record<string, T> {
  if (!spec || spec.length === 0) return { ...survey };

  const data: Record<string, unknown> = { ...(context as Record<string, unknown>), ...survey };
  const result: Record<string, T> = { ...survey };

  for (const element of spec) {
    if (element.variable in result && !evaluateConditions(element, data)) {
      delete result[element.variable];
    }
  }

  return result;
}
