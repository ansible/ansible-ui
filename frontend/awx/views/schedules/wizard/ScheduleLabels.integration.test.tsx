import { PageWizardBody } from '@ansible/ansible-ui-framework/PageWizard/PageWizardBody';
import { PageWizardProvider } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { useProcessSchedule } from '../hooks/useProcessSchedules';
import { useScheduleSteps } from '../hooks/useScheduleSteps';
import type { ScheduleFormWizard } from '../types';

const labels = Array.from({ length: 99 }, (_, index) => ({
  id: index + 1,
  name: `Schedule label ${index + 1}`,
  organization: 17,
}));
const templateDefault = { id: 100, name: 'Template default label', organization: 17 };
const schedule = {
  id: 7,
  name: 'Nightly schedule',
  description: '',
  timezone: 'UTC',
  enabled: true,
  extra_data: {},
  summary_fields: {},
};
const resources = [
  { endpoint: awxAPI`/job_templates/`, type: 'job_template' },
  { endpoint: awxAPI`/workflow_job_templates/`, type: 'workflow_job_template' },
] as const;
const permutations = resources.flatMap((resource) =>
  [true, false].map((askLabels) => ({ ...resource, askLabels }))
);
type Resource = (typeof resources)[number];
type Label = (typeof labels)[number];
type LabelPost = { id?: number; disassociate?: boolean; name?: string; organization?: number };
const server = setupServer();

function ScheduleLabelsWizard({
  onSaved,
  resource,
}: Readonly<{ onSaved: () => void; resource: Resource }>) {
  const getSteps = useScheduleSteps();
  const processSchedule = useProcessSchedule();
  // ponytail: rule editing is outside this regression; restore those steps for rule-edit coverage.
  const steps = getSteps(resource.endpoint).filter(
    (step) => step.id !== 'rules' && step.id !== 'exceptions'
  );
  return (
    <PageWizardProvider<ScheduleFormWizard>
      steps={steps}
      stepDefaults={{
        details: {
          name: schedule.name,
          description: schedule.description,
          schedule_type: resource.type,
          startDateTime: { date: '2030-01-01', time: '00:00' },
          timezone: 'UTC',
          enabled: true,
          rules: [{ id: 1, rule: 'DTSTART:20300101T000000Z\nRRULE:FREQ=DAILY' }],
          exceptions: [],
        },
        promptStep: {},
      }}
      onSubmit={async (values) => {
        await processSchedule(values);
        onSaved();
      }}
    >
      <PageWizardBody errorAdapter={awxErrorAdapter} />
    </PageWizardProvider>
  );
}

function setupWizard(resource: Resource, askLabels: boolean, initialLabels: Label[], edit = true) {
  const onSaved = vi.fn();
  const patches: unknown[] = [];
  const creates: unknown[] = [];
  const labelPosts: LabelPost[] = [];
  const labelPages: string[] = [];
  let associatedLabels = [...initialLabels];
  server.use(
    http.get(`${resource.endpoint}42/`, () =>
      HttpResponse.json({
        id: 42,
        type: resource.type,
        name: 'Scheduled template',
        organization: 17,
        ask_labels_on_launch: askLabels,
        summary_fields: { organization: { id: 17, name: 'Non-default organization' } },
      })
    ),
    http.get(`${resource.endpoint}42/launch/`, () =>
      HttpResponse.json({
        ask_labels_on_launch: askLabels,
        survey_enabled: false,
        defaults: { labels: [templateDefault], credentials: [], job_tags: '', skip_tags: '' },
      })
    ),
    http.get(awxAPI`/schedules/zoneinfo/`, () => HttpResponse.json({ zones: ['UTC'], links: {} })),
    http.get(awxAPI`/schedules/7/`, () => HttpResponse.json(schedule)),
    http.get(awxAPI`/labels/`, () =>
      HttpResponse.json({
        count: labels.length + 2,
        results: [
          ...labels,
          templateDefault,
          { id: 101, name: 'Other org label', organization: 1 },
        ],
        next: null,
        previous: null,
      })
    ),
    http.get(awxAPI`/schedules/7/labels/`, ({ request }) => {
      const page = new URL(request.url).searchParams.get('page') ?? '1';
      labelPages.push(page);
      return HttpResponse.json({
        count: associatedLabels.length,
        results: page === '1' ? associatedLabels.slice(0, 50) : associatedLabels.slice(50),
        next:
          page === '1' && associatedLabels.length > 50 ? awxAPI`/schedules/7/labels/?page=2` : null,
        previous: null,
      });
    }),
    http.get(`${resource.endpoint}42/survey_spec/`, () => HttpResponse.json({ spec: [] })),
    http.get(awxAPI`/config/`, () => HttpResponse.json({})),
    http.post(awxAPI`/schedules/preview/`, () =>
      HttpResponse.json({ local: ['2030-01-01T00:00:00Z'], utc: ['2030-01-01T00:00:00Z'] })
    ),
    http.patch(awxAPI`/schedules/7/`, async ({ request }) => {
      patches.push(await request.json());
      return HttpResponse.json(schedule);
    }),
    http.post(`${resource.endpoint}42/schedules/`, async ({ request }) => {
      creates.push(await request.json());
      return HttpResponse.json(schedule, { status: 201 });
    }),
    http.post(awxAPI`/schedules/7/labels/`, async ({ request }) => {
      const body = (await request.json()) as LabelPost;
      labelPosts.push(body);
      if (body.disassociate) {
        associatedLabels = associatedLabels.filter((label) => label.id !== body.id);
      } else {
        const label = labels.find(
          (label) => label.name === body.name && label.organization === body.organization
        ) ?? { id: 102, name: body.name!, organization: body.organization! };
        associatedLabels.push(label);
      }
      return new HttpResponse(null, { status: 204 });
    })
  );
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter
        initialEntries={[
          edit ? '/templates/42/schedules/7/edit' : '/templates/42/schedules/create',
        ]}
      >
        <Routes>
          <Route
            path={
              edit
                ? '/templates/:id/schedules/:schedule_id/edit'
                : '/templates/:id/schedules/create'
            }
            element={<ScheduleLabelsWizard onSaved={onSaved} resource={resource} />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
  return { onSaved, patches, creates, labelPosts, labelPages, getLabels: () => associatedLabels };
}

async function openLabels(user: ReturnType<typeof userEvent.setup>, askLabels: boolean) {
  expect(await screen.findByRole('textbox', { name: 'Schedule name' })).toHaveValue(schedule.name);
  // The loaded label control (not just the name field) gates navigation past async defaults.
  if (askLabels) {
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Next' }));
  }
  return screen.findByPlaceholderText('Select or create labels');
}

async function review(user: ReturnType<typeof userEvent.setup>, expected: string[]) {
  await user.click(screen.getByRole('button', { name: 'Next' }));
  const group = await screen.findByRole('group', { name: 'Review' });
  for (const name of expected) expect(within(group).getByText(name)).toBeInTheDocument();
  expect(within(group).queryByText(templateDefault.name)).not.toBeInTheDocument();
  return group;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

describe.each(permutations)('$type schedules, ask_labels_on_launch=$askLabels', (resource) => {
  const { askLabels } = resource;

  it('disassociates all 99 labels on save', async () => {
    const user = userEvent.setup();
    const state = setupWizard(resource, askLabels, labels);
    await openLabels(user, askLabels);
    await waitFor(() => expect(state.labelPages).toContain('2'));
    const selections = await screen.findByRole('list', { name: 'Current selections' });
    expect(within(selections).getByRole('button', { name: '96 more' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close label group' }));
    expect(within(selections).queryByText(labels[0].name)).not.toBeInTheDocument();
    expect(state.patches).toHaveLength(0);
    expect(state.labelPosts).toHaveLength(0);
    const group = await review(user, []);
    for (const label of labels)
      expect(within(group).queryByText(label.name)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(state.onSaved).toHaveBeenCalledOnce());

    expect(state.patches).toHaveLength(1);
    expect(state.patches[0]).not.toHaveProperty('labels');
    expect(state.patches[0]).not.toHaveProperty('launch_config');
    expect(state.labelPosts).toHaveLength(99);
    expect(state.labelPosts).toEqual(
      expect.arrayContaining(labels.map(({ id }) => ({ id, disassociate: true })))
    );
    expect(state.getLabels()).toHaveLength(0);
  }, 10000);

  it.each(['existing', 'new'])(
    'removes, retains and adds a %s label across Review back navigation',
    async (addition) => {
      const user = userEvent.setup();
      const state = setupWizard(resource, askLabels, labels.slice(0, 2));
      const input = await openLabels(user, askLabels);
      const selections = await screen.findByRole('list', { name: 'Current selections' });
      await user.click(within(selections).getByRole('button', { name: `Close ${labels[0].name}` }));
      const addedName = addition === 'existing' ? labels[2].name : 'New schedule label';
      await user.click(input);
      await user.paste(addedName);
      await user.click(
        await screen.findByRole('option', {
          name: addition === 'existing' ? addedName : `Create "${addedName}"`,
        })
      );
      let group = await review(user, [labels[1].name, addedName]);
      expect(within(group).queryByText(labels[0].name)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Back' }));
      if (askLabels) {
        await user.click(screen.getByRole('button', { name: 'Back' }));
        await openLabels(user, askLabels);
      }
      const restored = await screen.findByRole('list', { name: 'Current selections' });
      expect(within(restored).getByText(labels[1].name)).toBeInTheDocument();
      expect(within(restored).getByText(addedName)).toBeInTheDocument();
      expect(within(restored).queryByText(labels[0].name)).not.toBeInTheDocument();
      group = await review(user, [labels[1].name, addedName]);
      expect(within(group).queryByText(labels[0].name)).not.toBeInTheDocument();
      expect(state.labelPosts).toHaveLength(0);
      expect(state.patches).toHaveLength(0);
      await user.click(screen.getByRole('button', { name: 'Finish' }));
      await waitFor(() => expect(state.onSaved).toHaveBeenCalledOnce());

      expect(state.patches).toHaveLength(1);
      expect(state.labelPosts).toContainEqual({ id: labels[0].id, disassociate: true });
      expect(state.labelPosts.filter((post) => !post.disassociate)).toContainEqual({
        name: addedName,
        organization: 17,
      });
      // ponytail: AWX requires detaching non-prompted labels before PATCH; preserve in place
      // once the backend accepts updates with retained labels attached.
      expect(state.labelPosts).toEqual(
        askLabels
          ? [
              { id: labels[0].id, disassociate: true },
              { name: addedName, organization: 17 },
            ]
          : [
              { id: labels[0].id, disassociate: true },
              { id: labels[1].id, disassociate: true },
              { name: labels[1].name, organization: 17 },
              { name: addedName, organization: 17 },
            ]
      );
      expect(
        state
          .getLabels()
          .map(({ name }) => name)
          .sort()
      ).toEqual([labels[1].name, addedName].sort());
      expect(state.getLabels().every(({ organization }) => organization === 17)).toBe(true);
    },
    10000
  );

  it.each(['empty', 'existing', 'new'])(
    'creates a schedule with %s labels without inheriting template defaults',
    async (selection) => {
      const user = userEvent.setup();
      const state = setupWizard(resource, askLabels, [], false);
      const input = await openLabels(user, askLabels);
      const name = selection === 'existing' ? labels[0].name : 'New schedule label';
      if (selection !== 'empty') {
        await user.click(input);
        await user.paste(name);
        await user.click(
          await screen.findByRole('option', {
            name: selection === 'existing' ? name : `Create "${name}"`,
          })
        );
      }
      await review(user, selection === 'empty' ? [] : [name]);
      await user.click(screen.getByRole('button', { name: 'Finish' }));
      await waitFor(() => expect(state.onSaved).toHaveBeenCalledOnce());

      expect(state.creates).toHaveLength(1);
      expect(state.creates[0]).not.toHaveProperty('labels');
      expect(state.patches).toHaveLength(0);
      expect(state.labelPosts).toEqual(selection === 'empty' ? [] : [{ name, organization: 17 }]);
      expect(state.getLabels().map(({ name }) => name)).toEqual(
        selection === 'empty' ? [] : [name]
      );
    },
    10000
  );
});
