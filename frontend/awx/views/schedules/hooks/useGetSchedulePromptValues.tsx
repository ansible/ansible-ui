import { useCallback } from 'react';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Label } from '../../../interfaces/Label';
import { useParams } from 'react-router';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { Schedule } from '../../../interfaces/Schedule';
import { awxAPI } from '../../../common/api/awx-utils';
import { mergeArraysByCredentialType } from '../../../access/credentials/hooks/mergeArraysByCredentialType';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { Credential } from '../../../interfaces/Credential';
import { Survey } from '../../../interfaces/Survey';

/**
 * Custom hook for fetching and processing existing schedule prompt values during schedule editing workflows.
 *
 * ## Value Prioritization Logic
 * The hook prioritizes values in this order:
 * 1. **`schedule.summary_fields[field]`** - Relationship data from API (highest priority)
 * 2. **`schedule[field]`** - Direct schedule properties (medium priority)
 * 3. **`launchConfig.defaults[field]`** - Template defaults (fallback)
 *
 * ## Special Field Processing
 * - **`job_tags`, `skip_tags`**: Converts comma-separated strings to arrays of tag objects
 * - **`credentials`**: Merges template defaults with schedule-specific credentials by type
 * - **`instance_groups`**: Uses schedule-specific instance groups, ignoring defaults
 * - **`labels`**: Uses schedule-specific labels, ignoring defaults
 * - **`extra_vars`**: Extracts schedule extra_data, filtering out survey variables when survey is provided
 * - **All other fields**: Uses value as-is from the prioritization logic
 *
 * @returns A useCallback function that accepts launch configuration and related data, returning processed prompt values
 *
 * @see {@link PromptFormValues} for the structure of returned values
 * @see {@link LaunchConfiguration} for the structure of configuration and defaults
 * @see {@link ScheduleSelectStep} - Primary consumer of this hook
 * @see {@link ScheduleEditWizard} - Orchestrates the editing workflow
 *
 * @since 2.5
 */
export function useGetSchedulePromptValues() {
  const params = useParams();
  return useCallback(
    /**
     * Fetches schedule data and processes it into prompt form values.
     *
     * @param config - Full launch configuration object containing defaults and settings
     * @param credentials - Array of credentials associated with the schedule (will be merged with defaults)
     * @param instanceGroups - Array of instance groups associated with the schedule (replaces defaults)
     * @param scheduleLabels - Array of labels associated with the schedule (replaces defaults)
     * @param surveySpec - Optional survey specification for filtering extra_vars
     *
     * @returns Promise that resolves to processed prompt form values ready for form consumption
     *

     * ```
     */
    async (
      config: LaunchConfiguration,
      credentials: Credential[],
      instanceGroups: InstanceGroup[],
      scheduleLabels: Label[],
      surveySpec?: Survey
    ): Promise<PromptFormValues> => {
      const values: { [key: string]: unknown } = {};
      if (!params.schedule_id) {
        return {
          ...config.defaults,
          skip_tags: parseStringToTagArray(config.defaults.skip_tags),
          job_tags: parseStringToTagArray(config.defaults.job_tags),
        };
      }
      return requestGet<Schedule>(awxAPI`/schedules/${params.schedule_id}/`).then((schedule) => {
        const scheduleValueIsDefined = (scheduleKey: keyof Schedule) =>
          isValueDefined(schedule[scheduleKey]);
        const scheduleSummaryFieldIsDefined = (scheduleKey: keyof Schedule['summary_fields']) =>
          isValueDefined(schedule.summary_fields[scheduleKey]);
        const entries = Object.entries(config.defaults);
        entries.forEach(([key, defaultValue]) => {
          if (
            key in schedule.summary_fields &&
            scheduleSummaryFieldIsDefined(key as keyof Schedule['summary_fields'])
          ) {
            values[key] = (schedule.summary_fields as Record<string, unknown>)[key];
          } else if (
            Object.prototype.hasOwnProperty.call(schedule, key) &&
            scheduleValueIsDefined(key as keyof Schedule)
          ) {
            values[key] = schedule[key as keyof Schedule];
          } else if (key === 'extra_vars') {
            values[key] = extractScheduleExtraVars(schedule.extra_data, surveySpec);
          } else {
            values[key] = defaultValue;
          }
        });
        return refinePromptValues(values, credentials, instanceGroups, scheduleLabels);
      });
    },
    [params.schedule_id]
  );
}

/**
 * Processes and refines raw schedule values into the specific format required by PromptFormValues.
 *
 * This helper function handles the transformation of raw schedule data into the structured format
 * expected by the prompt form components. It applies special processing rules for different field types
 * and ensures the final result matches the PromptFormValues interface.
 *
 * ## Special Processing Rules:
 * - **String tags**: `job_tags` and `skip_tags` are converted from comma-separated strings to arrays
 * - **Credentials**: Template defaults are merged with schedule-specific credentials by credential type
 * - **Instance groups**: Schedule-specific instance groups completely replace template defaults
 * - **Labels**: Schedule-specific labels completely replace template defaults
 * - **Other fields**: Passed through as-is after the prioritization logic
 *
 * @param values - Raw values object from schedule processing (result of prioritization logic)
 * @param credentials - Credentials to merge with existing credential values from the schedule
 * @param instanceGroups - Instance groups to use in the final result (replaces any existing)
 * @param scheduleLabels - Labels to use in the final result (replaces any existing)
 *
 * @returns Processed PromptFormValues object ready for form consumption
 *
 * @internal This function is not exported and is only used within this module
 *
 * // Result: {
 * //   job_tags: ["deploy", "test"],           // parsed from string
 * //   credentials: [merged array],            // merged by type
 * //   instance_groups: [{ id: 1, name: "Production" }], // replaced
 * //   labels: [{ id: 1, name: "prod-label" }],          // replaced
 * //   verbosity: 2                            // passed through
 * // }
 * ```
 */
function refinePromptValues(
  values: { [key: string]: unknown },
  credentials?: Credential[],
  instanceGroups?: InstanceGroup[],
  scheduleLabels?: Label[]
) {
  const prioritizedValues = Object.entries(values);

  const refinedValues = prioritizedValues.reduce((accumulator, currentValue) => {
    const [key, value] = currentValue;
    if (key === 'job_tags' || key === 'skip_tags') {
      accumulator[key] = parseStringToTagArray(value as string);
      return accumulator;
    }
    if (key === 'credentials' && credentials?.length) {
      accumulator['credentials'] = mergeArraysByCredentialType(
        (values.credentials as Credential[]) || [],
        credentials
      );
      return accumulator;
    }
    if (key === 'instance_groups' && instanceGroups?.length) {
      accumulator['instance_groups'] = instanceGroups;
      return accumulator;
    }
    if (key === 'labels' && scheduleLabels?.length) {
      accumulator['labels'] = scheduleLabels;
      return accumulator;
    }

    return { ...accumulator, [key]: value };
  }, {} as PromptFormValues);
  return refinedValues;
}

function isValueDefined(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
    return false;
  }
  return true;
}

/**
 * Extracts extra variables from schedule data, filtering out survey variables when a survey is provided.
 *
 * When no survey is provided, returns all extra_data as-is. When a survey is provided,
 * filters out any variables that are defined in the survey spec to avoid duplication
 * (survey variables are handled separately by the survey form).
 *
 * @param extraData - The extra_data object from the schedule
 * @param surveySpec - Optional survey specification containing variable definitions
 * @returns Filtered extra_data object containing only non-survey variables
 *
 * @example
 * ```typescript
 * const extraData = { custom_var: "value", survey_var: "ignored" };
 * const survey = { spec: [{ variable: "survey_var", ... }] };
 * const result = extractScheduleExtraVars(extraData, survey);
 * // Result: { custom_var: "value" }
 * ```
 */
function extractScheduleExtraVars(extraData: Schedule['extra_data'], surveySpec?: Survey) {
  if (!surveySpec) return JSON.stringify(extraData);
  const scheduleExtraData = Object.entries(extraData);
  const extraVars = scheduleExtraData.reduce(
    (acc, [key, value]) => {
      const isSurveyItem = surveySpec.spec?.find((spec) => spec.variable === key);
      if (!isSurveyItem) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Schedule['extra_data']
  );
  return JSON.stringify(extraVars);
}
