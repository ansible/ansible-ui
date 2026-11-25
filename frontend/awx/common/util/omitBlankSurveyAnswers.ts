/**
 * Drop blank survey answers before merging over prompt-on-launch extra_vars.
 * Blank optional answers must not overwrite values from the Variables step (AAP-102632).
 * Uses explicit emptiness checks so valid answers like `0` or `false` are kept.
 */
export function omitBlankSurveyAnswers(
  survey: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!survey) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(survey).filter(([, value]) => {
      if (value === '' || value === null || value === undefined) {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    })
  );
}
