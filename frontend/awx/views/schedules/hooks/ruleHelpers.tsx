import { parseVariableField } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { useTranslation } from 'react-i18next';
import { Frequency, Options, RRule } from 'rrule';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { stringifyTags } from '../../../resources/templates/JobTemplateFormHelpers';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';

export function useGetFrequencyOptions() {
  const { t } = useTranslation();
  return [
    { label: t('Yearly'), value: Frequency.YEARLY },
    { label: t('Monthly'), value: Frequency.MONTHLY },
    { label: t('Weekly'), value: Frequency.WEEKLY },
    { label: t('Daily'), value: Frequency.DAILY },
    { label: t('Hourly'), value: Frequency.HOURLY },
    { label: t('Minutely'), value: Frequency.MINUTELY },
  ];
}

export function useGetWeekdayOptions() {
  const { t } = useTranslation();
  const weekdayOptions = [
    {
      value: RRule.SU,
      label: t('Sunday'),
    },
    {
      value: RRule.MO,
      label: t('Monday'),
    },
    {
      value: RRule.TU,
      label: t('Tuesday'),
    },
    {
      value: RRule.WE,
      label: t('Wednesday'),
    },
    {
      value: RRule.TH,
      label: t('Thursday'),
    },
    {
      value: RRule.FR,
      label: t('Friday'),
    },
    {
      value: RRule.SA,
      label: t('Saturday'),
    },
  ];
  return weekdayOptions;
}

export function useGetMonthOptions() {
  const { t } = useTranslation();
  return [
    {
      value: 1,
      label: t('January'),
    },
    {
      value: 2,
      label: t('February'),
    },
    {
      value: 3,
      label: t('March'),
    },
    {
      value: 4,
      label: t('April'),
    },
    {
      value: 5,
      label: t('May'),
    },
    {
      value: 6,
      label: t('June'),
    },
    {
      value: 7,
      label: t('July'),
    },
    {
      value: 8,
      label: t('August'),
    },
    {
      value: 9,
      label: t('September'),
    },
    {
      value: 10,
      label: t('October'),
    },
    {
      value: 11,
      label: t('November'),
    },
    {
      value: 12,
      label: t('December'),
    },
  ];
}

export function mungePromptData(
  prompt: PromptFormValues,
  launchConfig?: LaunchConfiguration | null
): Record<string, unknown> {
  if (prompt === undefined) return {};

  const result: Record<string, unknown> = {};

  // Always include these basic fields from prompt
  if (prompt.inventory?.id) {
    result.inventory = prompt.inventory.id;
  }

  if (prompt.execution_environment?.id) {
    result.execution_environment = prompt.execution_environment.id;
  }

  // Only include fields that are configured for prompting
  if (launchConfig) {
    if (launchConfig.ask_tags_on_launch) {
      result.job_tags = stringifyTags(prompt.job_tags) ?? '';
    }

    if (launchConfig.ask_skip_tags_on_launch) {
      result.skip_tags = stringifyTags(prompt.skip_tags) ?? '';
    }

    if (launchConfig.ask_limit_on_launch && prompt.limit) {
      result.limit = prompt.limit;
    }

    if (launchConfig.ask_job_type_on_launch && prompt.job_type) {
      result.job_type = prompt.job_type;
    }

    if (launchConfig.ask_verbosity_on_launch && prompt.verbosity !== undefined) {
      result.verbosity = prompt.verbosity;
    }

    if (launchConfig.ask_diff_mode_on_launch && prompt.diff_mode !== undefined) {
      result.diff_mode = prompt.diff_mode;
    }

    if (launchConfig.ask_scm_branch_on_launch && prompt.scm_branch) {
      result.scm_branch = prompt.scm_branch;
    }

    if (launchConfig.ask_forks_on_launch && prompt.forks !== undefined) {
      result.forks = prompt.forks;
    }

    if (launchConfig.ask_job_slice_count_on_launch && prompt.job_slice_count !== undefined) {
      result.job_slice_count = prompt.job_slice_count;
    }

    if (launchConfig.ask_timeout_on_launch && prompt.timeout !== undefined) {
      result.timeout = prompt.timeout;
    }

    if (launchConfig.ask_variables_on_launch && prompt.extra_vars) {
      result.extra_vars = prompt.extra_vars;
    }
  } else {
    // Fallback to original behavior if no launch config
    result.job_tags = stringifyTags(prompt.job_tags) ?? '';
    result.skip_tags = stringifyTags(prompt.skip_tags) ?? '';
  }

  return result;
}

export function mungeSurveyAndExtraVarsData(survey: { [key: string]: string }, extra_vars: string) {
  if (!survey && !extra_vars) return {};

  const extraData: { [key: string]: string } = {};
  Object.keys(survey).forEach((k: string) => {
    extraData[k] = survey[k];
  });

  return { ...extraData, ...parseVariableField(extra_vars) };
}

export const normalizeOptions = (options: Partial<Options>) => {
  // compiled from https://github.com/jkbrzt/rrule/blob/master/src/types.ts#L59
  const propertiesToNormalize = [
    'bysetpos',
    'bymonth',
    'bymonthday',
    'bynmonthday',
    'byyearday',
    'byweekno',
    'byhour',
    'byminute',
    'bysecond',
  ];
  const normalizeValue = (value: Options[keyof Options] | null) => {
    if (value === null || value === undefined) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    } else {
      return [value];
    }
  };
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => {
      let parsedValue = value;
      if (propertiesToNormalize.includes(key)) {
        parsedValue = normalizeValue(value) as Options[keyof Options] | null;
      }
      return [key, parsedValue];
    })
  );
};
