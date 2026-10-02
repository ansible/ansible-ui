import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { awxAPI } from '../../../common/api/awx-utils';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { RuleFields, RuleListItemType, ScheduleFormWizard } from '../types';
import { useScheduleSteps } from './useScheduleSteps';

const validRuleString = 'DTSTART:20240101T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1';
const mockRule: RuleListItemType = { id: 1, rule: validRuleString };
const askableLaunchConfig = { ask_inventory_on_launch: true } as unknown as LaunchConfiguration;
const nonAskableLaunchConfig = { ask_inventory_on_launch: false } as unknown as LaunchConfiguration;

type StepWithCallbacks = {
  id: string;
  hidden?: (wizardData: object) => boolean;
  validate?: (formData: object, wizardData: object) => Promise<void> | void;
};

function getStep(
  steps: ReturnType<ReturnType<typeof useScheduleSteps>>,
  id: string
): StepWithCallbacks {
  const step = steps.find((s) => s.id === id);
  if (!step) throw new Error(`Step '${id}' not found`);
  return step as StepWithCallbacks;
}

const previewCalls: { body: unknown }[] = [];
const server = setupServer(
  http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
    previewCalls.push({ body: await request.json() });
    return HttpResponse.json({ utc: ['2024-01-01T00:00:00Z'], local: ['2024-01-01T00:00:00Z'] });
  })
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  previewCalls.length = 0;
});
afterAll(() => server.close());

describe('useScheduleSteps', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useScheduleSteps());
    expect(typeof result.current).toBe('function');
  });

  it('should return 6 steps when called', () => {
    const { result } = renderHook(() => useScheduleSteps());
    expect(result.current().length).toBe(6);
  });

  it('should return steps with the correct ids in order', () => {
    const { result } = renderHook(() => useScheduleSteps());
    expect(result.current().map((s) => s.id)).toEqual([
      'details',
      'promptStep',
      'survey',
      'rules',
      'exceptions',
      'review',
    ]);
  });
});

describe('promptStep hidden', () => {
  let hidden: (data: object) => boolean;
  beforeEach(() => {
    const { result } = renderHook(() => useScheduleSteps());
    const step = getStep(result.current(), 'promptStep');
    expect(step.hidden).toBeDefined();
    hidden = step.hidden!;
  });

  it('should be hidden when wizardData is empty', () => {
    expect(hidden({})).toBe(true);
  });

  it('should be hidden when launch_config is null', () => {
    expect(
      hidden({
        schedule_type: 'job_template',
        resource: { type: 'job_template' },
        resourceId: 1,
        launch_config: null,
      })
    ).toBe(true);
  });

  it('should be hidden when schedule_type is not a template type', () => {
    expect(hidden({ schedule_type: 'project' })).toBe(true);
  });

  it('should be hidden when schedule_type is job_template but neither resource nor resourceId is set', () => {
    expect(hidden({ schedule_type: 'job_template', launch_config: askableLaunchConfig })).toBe(
      true
    );
  });

  it('should be hidden when launch_config has no askable fields', () => {
    expect(
      hidden({
        schedule_type: 'job_template',
        resourceId: 1,
        launch_config: nonAskableLaunchConfig,
      })
    ).toBe(true);
  });

  it('should be visible when schedule_type is job_template with askable field and resourceId set', () => {
    expect(
      hidden({ schedule_type: 'job_template', resourceId: 1, launch_config: askableLaunchConfig })
    ).toBe(false);
  });

  it('should be visible when schedule_type is workflow_job_template with askable field', () => {
    expect(
      hidden({
        schedule_type: 'workflow_job_template',
        resourceId: 1,
        launch_config: askableLaunchConfig,
      })
    ).toBe(false);
  });

  it('should be visible when resource.type is job_template with askable field and resourceId', () => {
    expect(
      hidden({
        resource: { type: 'job_template' },
        resourceId: 1,
        launch_config: askableLaunchConfig,
      })
    ).toBe(false);
  });
});

describe('survey step hidden', () => {
  let hidden: (data: object) => boolean;
  beforeEach(() => {
    const { result } = renderHook(() => useScheduleSteps());
    const step = getStep(result.current(), 'survey');
    expect(step.hidden).toBeDefined();
    hidden = step.hidden!;
  });

  it('should be hidden when wizardData is empty', () => {
    expect(hidden({})).toBe(true);
  });

  it('should be hidden when launch_config is absent', () => {
    expect(hidden({ name: 'x' })).toBe(true);
  });

  it('should be hidden when launch_config.survey_enabled is false', () => {
    expect(hidden({ launch_config: { survey_enabled: false } })).toBe(true);
  });

  it('should be visible when launch_config.survey_enabled is true', () => {
    expect(hidden({ launch_config: { survey_enabled: true } })).toBe(false);
  });
});

describe('rules step validate', () => {
  let validate: ((formData: object, wizardData: object) => Promise<void> | void) | undefined;
  beforeEach(() => {
    const { result } = renderHook(() => useScheduleSteps());
    validate = getStep(result.current(), 'rules').validate;
    expect(validate).toBeDefined();
  });

  const emptyRules: Partial<RuleFields> = { rules: [] };
  const noRules: Partial<RuleFields> = {};
  const withRule: Partial<RuleFields> = { rules: [mockRule] };

  it('should throw RequestError when rules is empty', () => {
    expect(() => validate!(emptyRules as object, {})).toThrow(RequestError);
  });

  it('should throw RequestError when rules is undefined', () => {
    expect(() => validate!(noRules as object, {})).toThrow(RequestError);
  });

  it('should not throw when rules has at least one entry', () => {
    expect(() => validate!(withRule as object, {})).not.toThrow();
  });
});

describe('review step validate', () => {
  let validate: ((formData: object, wizardData: object) => Promise<void> | void) | undefined;
  beforeEach(() => {
    const { result } = renderHook(() => useScheduleSteps());
    validate = getStep(result.current(), 'review').validate;
    expect(validate).toBeDefined();
  });

  const emptyWizard: Partial<ScheduleFormWizard> = { rules: [], exceptions: [] };
  const validWizard: Partial<ScheduleFormWizard> = { rules: [mockRule], exceptions: [] };

  it('should throw RequestError when rules is empty', async () => {
    await expect(validate!({}, emptyWizard as object)).rejects.toThrow(RequestError);
  });

  it('should throw RequestError when preview returns no future dates', async () => {
    server.use(
      http.post(awxAPI`/schedules/preview/`, () => HttpResponse.json({ utc: [], local: [] }))
    );
    await expect(validate!({}, validWizard as object)).rejects.toThrow(RequestError);
  });

  it('should resolve without error when preview returns future dates', async () => {
    await expect(validate!({}, validWizard as object)).resolves.toBeUndefined();
  });

  it('should resolve when exceptions is undefined', async () => {
    const wizardWithoutExceptions: Partial<ScheduleFormWizard> = { rules: [mockRule] };
    await expect(validate!({}, wizardWithoutExceptions as object)).resolves.toBeUndefined();
  });

  it('should POST the serialized rrule string to /schedules/preview/', async () => {
    await validate!({}, validWizard as object);
    expect(previewCalls).toHaveLength(1);
    const body = previewCalls[0].body as Record<string, unknown>;
    expect(body).toHaveProperty('rrule');
    expect(typeof body['rrule']).toBe('string');
  });
});
