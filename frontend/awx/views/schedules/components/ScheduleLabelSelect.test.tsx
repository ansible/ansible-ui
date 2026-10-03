import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ComponentProps, useState } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleLabelSelect } from './ScheduleLabelSelect';

type Props = ComponentProps<typeof ScheduleLabelSelect>;
const orgLabel = {
  id: 1,
  name: 'dev',
  organization: 7,
  summary_fields: { organization: { id: 7, name: 'Engineering', description: '' } },
};
const globalLabel = { id: 2, name: 'dev', organization: null };
const uniqueLabel = { id: 3, name: 'production', organization: 7 };
const unrelatedLabel = { id: 4, name: 'unrelated', organization: 8 };
const apiLabels = [orgLabel, globalLabel, uniqueLabel, unrelatedLabel];
const server = setupServer(
  http.get(awxAPI`/labels/`, () =>
    HttpResponse.json({ count: apiLabels.length, results: apiLabels, next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function ControlledSelector(props: Readonly<Props>) {
  const [labels, setLabels] = useState(props.labels);
  return (
    <ScheduleLabelSelect
      organization={props.organization}
      labels={labels}
      onChange={(next) => {
        props.onChange(next);
        setLabels(next);
      }}
    />
  );
}

function renderSelector(labels: Props['labels'] = [], organization: number | null = 7) {
  const onChange = vi.fn<Props['onChange']>();
  const user = userEvent.setup();
  render(
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      <ControlledSelector labels={labels} organization={organization} onChange={onChange} />
    </SWRConfig>
  );
  return { onChange, user };
}

async function readyInput() {
  await waitFor(() => expect(screen.getByRole('textbox')).toBeEnabled());
  return screen.getByRole('textbox');
}

describe('ScheduleLabelSelect', () => {
  it('explains that labels are limited to the selected organization', async () => {
    const { user } = renderSelector();
    await readyInput();

    const formGroup = screen.getByTestId(/input-form-group$/);
    await user.click(within(formGroup).getAllByRole('button')[0]);

    expect(await screen.findByText('Label availability')).toBeVisible();
    expect(
      screen.getByText('Only labels from the selected organization are available.')
    ).toBeVisible();
  });

  it('selects duplicate org and global names by identity and excludes unrelated organizations', async () => {
    const { user, onChange } = renderSelector();
    const input = await readyInput();

    await user.click(input);
    expect(await screen.findByRole('option', { name: 'dev' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'dev (Global)' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'production' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'unrelated' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'dev' }));
    expect(onChange).toHaveBeenLastCalledWith([orgLabel]);
    expect(screen.getByRole('button', { name: 'Close dev' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close dev' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('renders canonical prop changes without replacing a selected object with the API response', async () => {
    const selected = { id: 1, name: 'dev', organization: 7 };
    const onChange = vi.fn<Props['onChange']>();
    const user = userEvent.setup();
    const config = { provider: () => new Map(), shouldRetryOnError: false };
    const { rerender } = render(
      <SWRConfig value={config}>
        <ScheduleLabelSelect labels={[selected]} organization={7} onChange={onChange} />
      </SWRConfig>
    );
    await readyInput();
    await user.type(screen.getByRole('textbox'), 'dev (Global)');
    await user.keyboard('{Enter}');
    expect(onChange.mock.lastCall?.[0]?.[0]).toBe(selected);
    expect(screen.queryByRole('button', { name: 'Close dev (Global)' })).not.toBeInTheDocument();
    rerender(
      <SWRConfig value={config}>
        <ScheduleLabelSelect labels={[]} organization={7} onChange={onChange} />
      </SWRConfig>
    );
    expect(
      screen.queryByRole('button', { name: 'Close dev (Engineering)' })
    ).not.toBeInTheDocument();
  });

  it('creates an org-scoped label without an id and preserves hidden selected identities', async () => {
    const hidden = { id: 50, name: 'hidden', organization: 99 };
    const unavailable = { id: 51, name: 'unavailable', organization: 7 };
    const { user, onChange } = renderSelector([hidden, unavailable]);
    await readyInput();

    await user.type(screen.getByRole('textbox'), 'new label');
    await user.click(await screen.findByRole('option', { name: 'Create "new label"' }));
    expect(onChange).toHaveBeenLastCalledWith([
      hidden,
      unavailable,
      { name: 'new label', organization: 7 },
    ]);
    expect(onChange.mock.lastCall?.[0]?.[0]).toBe(hidden);
    expect(onChange.mock.lastCall?.[0]?.[1]).toBe(unavailable);

    await user.click(screen.getByRole('button', { name: 'Close hidden' }));
    expect(onChange).toHaveBeenLastCalledWith([
      unavailable,
      { name: 'new label', organization: 7 },
    ]);
    await user.click(screen.getByRole('button', { name: 'Close label group' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('disables label selection when the resource has no organization', async () => {
    const { onChange } = renderSelector([], null);

    expect(await screen.findByText('Cannot create schedule labels')).toBeVisible();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.queryByRole('option', { name: 'dev' })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses organization IDs when names are unavailable and avoids literal display-name collisions', async () => {
    const literal = { id: 6, name: 'dev (7)', organization: 7 };
    server.use(
      http.get(awxAPI`/labels/`, () =>
        HttpResponse.json({
          results: [{ ...orgLabel, summary_fields: {} }, globalLabel, literal],
          next: null,
        })
      )
    );
    const { user, onChange } = renderSelector();
    await readyInput();
    await user.click(screen.getByRole('textbox'));
    await user.click(await screen.findByRole('option', { name: 'dev' }));
    expect(onChange).toHaveBeenLastCalledWith([{ ...orgLabel, summary_fields: {} }]);
    await user.click(screen.getByRole('textbox'));
    await user.click(await screen.findByRole('option', { name: 'dev (7)' }));
    expect(onChange.mock.lastCall?.[0]?.[1]).toEqual(literal);
  });

  it('waits for all pages before enabling creation', async () => {
    server.use(
      http.get(awxAPI`/labels/`, async ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        if (page === '1')
          return HttpResponse.json({ results: [uniqueLabel], next: awxAPI`/labels/?page=2` });
        await delay(150);
        return HttpResponse.json({ results: [orgLabel], next: null });
      })
    );
    const { user, onChange } = renderSelector();
    expect(screen.getByRole('textbox')).toBeDisabled();
    await user.type(screen.getByRole('textbox'), 'dev');
    expect(onChange).not.toHaveBeenCalled();
    await readyInput();
    await user.type(screen.getByRole('textbox'), 'dev');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith([orgLabel]);
  });

  it('surfaces API errors and disables creation rather than fabricating identities', async () => {
    server.use(
      http.get(awxAPI`/labels/`, () =>
        HttpResponse.json({ detail: 'Permission denied' }, { status: 403 })
      )
    );
    const { user, onChange } = renderSelector([uniqueLabel]);
    expect(await screen.findByText('Permission denied')).toBeVisible();
    expect(screen.getByRole('textbox')).toBeDisabled();
    await user.type(screen.getByRole('textbox'), 'new');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close production' })).toBeInTheDocument();
  });

  it.each([99, 100, 101])('warns non-blockingly at the threshold with %i labels', async (count) => {
    const labels = Array.from({ length: count }, (_, id) => ({
      id: id + 100,
      name: `label ${id}`,
      organization: 7,
    }));
    const { user, onChange } = renderSelector(labels);
    await readyInput();
    const warning = screen.queryByText(
      'The API supports a maximum of 100 labels per schedule. Consider reducing the number of labels.'
    );
    expect(!!warning).toBe(count >= 100);
    await user.type(screen.getByRole('textbox'), 'another');
    await user.click(await screen.findByRole('option', { name: 'Create "another"' }));
    expect(onChange).toHaveBeenLastCalledWith([...labels, { name: 'another', organization: 7 }]);
  });
});
