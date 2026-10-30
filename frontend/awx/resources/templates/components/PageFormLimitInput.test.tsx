/* eslint-disable i18next/no-literal-string */
import { ReactNode, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  fetchInventoryResourcesByNames,
  LimitHostsGroupsSelectDialog,
  PageFormLimitInput,
} from './PageFormLimitInput';

function LimitWatch() {
  const { watch } = useFormContext();
  return <div data-testid="limit-value">{String(watch('limit') ?? '')}</div>;
}

function TestWrapper({
  children,
  defaultLimit = '',
}: {
  children: ReactNode;
  defaultLimit?: string;
}) {
  const methods = useForm({ defaultValues: { limit: defaultLimit } });
  return (
    <MemoryRouter>
      <PageDialogProvider>
        <FormProvider {...methods}>
          {children}
          <LimitWatch />
        </FormProvider>
      </PageDialogProvider>
    </MemoryRouter>
  );
}

function renderDialog(
  props: Partial<{
    inventoryId: number;
    currentLimit: string;
    onApply: (limit: string) => void;
  }> = {}
) {
  const onApply = props.onApply ?? vi.fn();
  return {
    onApply,
    ...render(
      <MemoryRouter>
        <PageDialogProvider>
          <LimitHostsGroupsSelectDialog
            inventoryId={props.inventoryId ?? 1}
            currentLimit={props.currentLimit ?? ''}
            onApply={onApply}
          />
        </PageDialogProvider>
      </MemoryRouter>
    ),
  };
}

const RESOURCE_ROW_IDS: Record<string, number> = {
  web01: 1,
  web02: 2,
  web03: 3,
  db01: 21,
  webservers: 10,
  dbservers: 11,
};

function selectedNamesText() {
  return screen.getByTestId('limit-all-selected-names').textContent ?? '';
}

function previewText() {
  return screen.getByTestId('limit-preview-value').textContent ?? '';
}

function clickRemoveUnmatched(name: string) {
  fireEvent.click(screen.getByRole('button', { name: `Remove ${name} from Limit` }));
}

function resourceRow(name: string) {
  const id = RESOURCE_ROW_IDS[name];
  if (id === undefined) {
    throw new Error(`Unknown test resource: ${name}`);
  }
  return screen.queryByTestId(`row-id-${id}`);
}

function rowCheckbox(name: string) {
  const row = resourceRow(name);
  return row ? within(row).queryByRole('checkbox') : null;
}

function clickRowCheckbox(name: string) {
  const checkbox = rowCheckbox(name);
  expect(checkbox).toBeTruthy();
  fireEvent.click(checkbox as HTMLElement);
}

async function waitForCheckedRows(...names: string[]) {
  await waitFor(
    () => {
      for (const name of names) {
        expect(rowCheckbox(name)).toBeChecked();
      }
    },
    { timeout: 8000 }
  );
}

const listOptions = { actions: { GET: {} } };
const filterableNameOptions = {
  actions: {
    GET: {
      name: {
        type: 'string',
        label: 'Name',
        filterable: true,
      },
    },
  },
};

const hostsFixture = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'web01',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'web02',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
    {
      id: 3,
      name: 'web03',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
  ],
};

const groupsFixture = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 10,
      name: 'webservers',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
    {
      id: 11,
      name: 'dbservers',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
  ],
};

const inventory2Hosts = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 21,
      name: 'db01',
      created: '2026-01-01T00:00:00Z',
      modified: '2026-01-01T00:00:00Z',
    },
  ],
};

const emptyList = { count: 0, next: null, previous: null, results: [] };

const lookupUrls: string[] = [];

function paginate<T>(items: T[], requestUrl: URL) {
  const page = Number(requestUrl.searchParams.get('page') || '1');
  const pageSize = Number(requestUrl.searchParams.get('page_size') || '10');
  const start = (page - 1) * pageSize;
  const results = items.slice(start, start + pageSize);
  return {
    count: items.length,
    next: start + pageSize < items.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}

function hostHandler(inventoryId: string, allHosts: typeof hostsFixture) {
  return http.get(awxAPI`/inventories/${inventoryId}/hosts/`, ({ request }) => {
    const url = new URL(request.url);
    const nameIn = url.searchParams.get('name__in');
    if (nameIn) {
      lookupUrls.push(url.toString());
      const names = nameIn.split(',');
      const results = allHosts.results.filter((host) => names.includes(host.name));
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }
    let items = allHosts.results;
    const search = url.searchParams.get('search') ?? url.searchParams.get('name__icontains');
    if (search) {
      items = items.filter((host) => host.name.includes(search));
    }
    return HttpResponse.json(paginate(items, url));
  });
}

function groupHandler(inventoryId: string, allGroups: typeof groupsFixture | typeof emptyList) {
  return http.get(awxAPI`/inventories/${inventoryId}/groups/`, ({ request }) => {
    const url = new URL(request.url);
    const nameIn = url.searchParams.get('name__in');
    if (nameIn) {
      lookupUrls.push(url.toString());
      const names = nameIn.split(',');
      const results = allGroups.results.filter((group) => names.includes(group.name));
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }
    return HttpResponse.json(paginate(allGroups.results, url));
  });
}

const server = setupServer(
  http.options(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json(listOptions)),
  http.options(awxAPI`/inventories/1/groups/`, () => HttpResponse.json(listOptions)),
  http.options(awxAPI`/inventories/2/hosts/`, () => HttpResponse.json(listOptions)),
  http.options(awxAPI`/inventories/2/groups/`, () => HttpResponse.json(listOptions)),
  hostHandler('1', hostsFixture),
  groupHandler('1', groupsFixture),
  hostHandler('2', inventory2Hosts),
  groupHandler('2', emptyList)
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
beforeEach(() => {
  localStorage.setItem('perPage', '10');
});
afterEach(() => {
  lookupUrls.length = 0;
  localStorage.removeItem('perPage');
  server.resetHandlers();
});
afterAll(() => server.close());

describe('PageFormLimitInput', () => {
  it('renders the label and text input', () => {
    render(
      <TestWrapper>
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" />
      </TestWrapper>
    );
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter limit')).toBeInTheDocument();
  });

  it('disables the browse button when no inventory is selected', async () => {
    render(
      <TestWrapper>
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Browse hosts and groups' })).toBeDisabled();
    });
  });

  it('enables the browse button once an inventory is selected', async () => {
    render(
      <TestWrapper>
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={1} />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Browse hosts and groups' })).toBeEnabled();
    });
  });

  it('reads unsaved Limit text when the picker opens and preselects matching names', async () => {
    render(
      <TestWrapper>
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={1} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter limit'), {
      target: { value: 'web01,web02,web03' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));

    await waitForCheckedRows('web01', 'web02', 'web03');
    expect(selectedNamesText()).toBe('web01, web02, web03');
  }, 15000);

  it('does not change Limit when the dialog is cancelled after a deselect', async () => {
    render(
      <TestWrapper defaultLimit="web01,web02,web03">
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={1} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));
    await waitForCheckedRows('web02');
    clickRowCheckbox('web02');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('limit-value')).toHaveTextContent('web01,web02,web03');
  }, 15000);

  it('does not carry selections from a previous inventory when the picker is reopened', async () => {
    function InventorySwitchLimit() {
      const [inventoryId, setInventoryId] = useState(1);
      return (
        <>
          <button type="button" onClick={() => setInventoryId(2)}>
            Use other inventory
          </button>
          <PageFormLimitInput
            name="limit"
            label="Limit"
            placeholder="Enter limit"
            inventoryId={inventoryId}
          />
        </>
      );
    }

    render(
      <TestWrapper defaultLimit="web01,web02">
        <InventorySwitchLimit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));
    await waitForCheckedRows('web01', 'web02');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Use other inventory' }));
    expect(screen.getByTestId('limit-value')).toHaveTextContent('web01,web02');
    await waitFor(
      () => expect(screen.getByTestId('limit-unmatched-field-helper')).toBeInTheDocument(),
      { timeout: 8000 }
    );
    expect(screen.getByTestId('limit-unmatched-field-helper')).toHaveTextContent(
      'Names not found in this inventory: web01, web02.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));

    await waitFor(() => expect(screen.getByText('db01')).toBeInTheDocument(), { timeout: 8000 });
    expect(screen.getByTestId('limit-unmatched-section')).toBeInTheDocument();
    expect(selectedNamesText()).toBe('None');
    expect(rowCheckbox('db01')).not.toBeChecked();
    expect(resourceRow('web01')).not.toBeInTheDocument();
    expect(previewText()).toBe('web01,web02');
  }, 15000);

  it('shows unmatched names as compact helper text under Limit without opening the picker', async () => {
    render(
      <TestWrapper defaultLimit="web01,web02">
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={2} />
      </TestWrapper>
    );

    await waitFor(
      () => expect(screen.getByTestId('limit-unmatched-field-helper')).toBeInTheDocument(),
      { timeout: 8000 }
    );
    const helper = screen.getByTestId('limit-unmatched-field-helper');
    const formGroup = screen.getByTestId('limit-form-group');
    const helperItem = helper.closest('.pf-v6-c-helper-text__item');
    expect(helper).toHaveTextContent('Names not found in this inventory: web01, web02.');
    expect(formGroup).toContainElement(helper);
    expect(helper.closest('.pf-v6-c-form__helper-text')).not.toBeNull();
    expect(helper.closest('.pf-v6-c-form__group-control')).not.toBeNull();
    expect(helperItem).toHaveClass('pf-m-warning');
    expect(helperItem?.querySelector('.pf-v6-c-helper-text__item-icon')).toBeInTheDocument();
    expect(formGroup.querySelector('.pf-v6-c-alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter limit')).not.toBeInvalid();
  }, 15000);

  it('wraps long unmatched hostnames in the Limit helper text', async () => {
    render(
      <TestWrapper defaultLimit="web01,dhcp230-38.awxlab.pnq2.redhat.com">
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={2} />
      </TestWrapper>
    );

    await waitFor(
      () => expect(screen.getByTestId('limit-unmatched-field-helper')).toBeInTheDocument(),
      { timeout: 8000 }
    );
    const helper = screen.getByTestId('limit-unmatched-field-helper');
    expect(helper).toHaveTextContent(
      'Names not found in this inventory: web01, dhcp230-38.awxlab.pnq2.redhat.com.'
    );
    expect(screen.getByTestId('limit-form-group')).toContainElement(helper);
    expect(helper.closest('.pf-v6-c-form__group-control')).toContainElement(helper);
    expect(helper).toHaveStyle({ overflowWrap: 'anywhere' });
  }, 15000);

  it('shows a lookup error under Limit instead of reporting names as missing', async () => {
    server.use(
      http.get(awxAPI`/inventories/1/hosts/`, () =>
        HttpResponse.json({ detail: 'Unable to query hosts' }, { status: 500 })
      )
    );
    render(
      <TestWrapper defaultLimit="web01">
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={1} />
      </TestWrapper>
    );

    await waitFor(() => expect(screen.getByTestId('limit-lookup-error')).toBeInTheDocument(), {
      timeout: 8000,
    });
    const lookupError = screen.getByTestId('limit-lookup-error');
    expect(screen.queryByTestId('limit-unmatched-field-helper')).not.toBeInTheDocument();
    expect(screen.getByTestId('limit-form-group')).toContainElement(lookupError);
    expect(lookupError.closest('.pf-v6-c-form__helper-text')).not.toBeNull();
    expect(lookupError.closest('.pf-v6-c-helper-text__item')).toHaveClass('pf-m-error');
    expect(screen.getByPlaceholderText('Enter limit')).not.toBeInvalid();
    expect(screen.getByTestId('limit-value')).toHaveTextContent('web01');
  }, 15000);
});

describe('LimitHostsGroupsSelectDialog', () => {
  it('lists hosts from the selected inventory', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('web01')).toBeInTheDocument();
      expect(screen.getByText('web03')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Select hosts and groups' })).toBeInTheDocument();
  });

  it('looks up matching names without downloading the whole inventory', async () => {
    const result = await fetchInventoryResourcesByNames(1, ['web01', 'webservers', 'missing']);
    expect(result.hosts.map((host) => host.name)).toEqual(['web01']);
    expect(result.groups.map((group) => group.name)).toEqual(['webservers']);
    expect(lookupUrls.length).toBeGreaterThan(0);
    expect(lookupUrls.every((url) => url.includes('name__in='))).toBe(true);
    expect(lookupUrls.every((url) => !url.includes('page_size=10000'))).toBe(true);
  });

  it('preselects matching hosts when the picker is reopened', async () => {
    renderDialog({ currentLimit: 'web01,web02,web03' });

    await waitForCheckedRows('web01', 'web02', 'web03');
    expect(screen.getByRole('button', { name: 'Apply selection' })).toBeInTheDocument();
    expect(selectedNamesText()).toBe('web01, web02, web03');
    expect(lookupUrls.some((url) => url.includes('name__in='))).toBe(true);
    expect(lookupUrls.every((url) => !url.includes('page_size=10000'))).toBe(true);
  }, 15000);

  it('preselects mixed hosts and groups', async () => {
    renderDialog({ currentLimit: 'web01,webservers' });

    await waitForCheckedRows('web01');
    expect(selectedNamesText()).toMatch(/web01, webservers|webservers, web01/);

    fireEvent.click(screen.getByRole('tab', { name: 'Groups' }));
    await waitForCheckedRows('webservers');
    expect(rowCheckbox('dbservers')).not.toBeChecked();
  }, 15000);

  it('keeps host selections when switching to Groups and back', async () => {
    renderDialog({ currentLimit: 'web01' });
    await waitForCheckedRows('web01');

    fireEvent.click(screen.getByRole('tab', { name: 'Groups' }));
    await waitFor(() => expect(screen.getByText('webservers')).toBeInTheDocument(), {
      timeout: 8000,
    });
    expect(selectedNamesText()).toBe('web01');
    fireEvent.click(screen.getByRole('tab', { name: 'Hosts' }));

    await waitForCheckedRows('web01');
    expect(selectedNamesText()).toBe('web01');
  }, 15000);

  it('keeps a selection that is not on the current page', async () => {
    localStorage.setItem('perPage', '1');
    renderDialog({ currentLimit: 'web02' });

    await waitFor(() => expect(selectedNamesText()).toBe('web02'), { timeout: 8000 });
    await waitFor(() => expect(resourceRow('web01')).toBeInTheDocument(), { timeout: 8000 });
    expect(resourceRow('web02')).not.toBeInTheDocument();

    const hostsTab = screen.getByTestId('limit-hosts-tab');
    const next = within(hostsTab).getByRole('button', { name: /next/i });
    fireEvent.click(next);

    await waitForCheckedRows('web02');
    expect(selectedNamesText()).toBe('web02');
  }, 15000);

  it('deselecting a host and applying updates Limit', async () => {
    const { onApply } = renderDialog({ currentLimit: 'web01,web02,web03' });
    await waitForCheckedRows('web02');

    clickRowCheckbox('web02');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));

    expect(onApply).toHaveBeenCalledWith('web01,web03');
  }, 15000);

  it('preserves Limit when applying without changes', async () => {
    const { onApply } = renderDialog({ currentLimit: ' web01 , web02 ' });
    await waitForCheckedRows('web01');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith(' web01 , web02 ');
  }, 15000);

  it('does not apply Limit when Cancel is clicked', async () => {
    const { onApply } = renderDialog({ currentLimit: 'web01,web02' });
    await waitForCheckedRows('web01');
    clickRowCheckbox('web01');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onApply).not.toHaveBeenCalled();
  }, 15000);

  it('does not preselect names from another inventory', async () => {
    renderDialog({ inventoryId: 2, currentLimit: 'web01,web02' });

    await waitFor(() => expect(screen.getByText('db01')).toBeInTheDocument(), { timeout: 8000 });
    expect(screen.getByTestId('limit-unmatched-section')).toBeInTheDocument();
    expect(screen.getByText('web01')).toBeInTheDocument();
    expect(screen.getByText('web02')).toBeInTheDocument();
    expect(rowCheckbox('db01')).not.toBeChecked();
    expect(selectedNamesText()).toBe('None');
    expect(previewText()).toBe('web01,web02');
    expect(resourceRow('web01')).not.toBeInTheDocument();
  }, 15000);

  it('preserves advanced patterns and explains that checkboxes cannot edit them', async () => {
    const { onApply } = renderDialog({ currentLimit: 'web*,web01,!db01' });

    await waitForCheckedRows('web01');
    expect(
      screen.getByText('Some Limit patterns cannot be edited with checkboxes')
    ).toBeInTheDocument();

    clickRowCheckbox('web01');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('web*,!db01');
  }, 15000);

  it('uses Add to limit when Limit is empty and appends selected names', async () => {
    const { onApply } = renderDialog({ currentLimit: '' });
    await waitFor(() => expect(rowCheckbox('web01')).toBeTruthy(), { timeout: 8000 });
    clickRowCheckbox('web01');
    fireEvent.click(screen.getByRole('tab', { name: 'Groups' }));
    await waitFor(() => expect(rowCheckbox('webservers')).toBeTruthy(), { timeout: 8000 });
    clickRowCheckbox('webservers');
    fireEvent.click(screen.getByRole('button', { name: 'Add to limit' }));
    expect(onApply).toHaveBeenCalledWith('web01,webservers');
  }, 20000);

  it('keeps host selection after searching the hosts table', async () => {
    server.use(
      http.options(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json(filterableNameOptions)),
      http.options(awxAPI`/inventories/1/groups/`, () => HttpResponse.json(filterableNameOptions))
    );
    renderDialog({ currentLimit: 'web01,web02' });
    await waitForCheckedRows('web01', 'web02');

    const hostsTab = screen.getByTestId('limit-hosts-tab');
    const searchBox = await waitFor(() => within(hostsTab).getByPlaceholderText('Enter search'), {
      timeout: 8000,
    });
    fireEvent.change(searchBox, { target: { value: 'web03' } });

    await waitFor(
      () => {
        expect(rowCheckbox('web03')).toBeTruthy();
        expect(rowCheckbox('web01')).toBeNull();
      },
      { timeout: 8000 }
    );
    expect(selectedNamesText()).toBe('web01, web02');
  }, 15000);

  it('previews the complete Limit including unmatched names and advanced patterns', async () => {
    renderDialog({ inventoryId: 2, currentLimit: 'web*,web01,db01' });

    await waitForCheckedRows('db01');
    expect(previewText()).toBe('web*,web01,db01');
    expect(screen.getByTestId('limit-unmatched-section')).toHaveTextContent('web01');
  }, 15000);

  it('removes unmatched names from Limit only after Apply selection', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02,db01' });

    await waitForCheckedRows('db01');
    expect(previewText()).toBe('web01,web02,db01');

    clickRemoveUnmatched('web01');
    expect(previewText()).toBe('web02,db01');
    expect(
      screen.queryByRole('button', { name: 'Remove web01 from Limit' })
    ).not.toBeInTheDocument();

    clickRemoveUnmatched('web02');
    expect(previewText()).toBe('db01');
    expect(screen.queryByTestId('limit-unmatched-section')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('db01');
  }, 15000);

  it('removes all unmatched names with one action and applies the remaining Limit', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02,db01' });

    await waitForCheckedRows('db01');
    fireEvent.click(screen.getByTestId('limit-unmatched-remove-all'));
    expect(previewText()).toBe('db01');
    expect(screen.queryByTestId('limit-unmatched-section')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('db01');
  }, 15000);

  it('does not change Limit when unmatched removals are cancelled', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02,db01' });

    await waitForCheckedRows('db01');
    clickRemoveUnmatched('web01');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onApply).not.toHaveBeenCalled();
  }, 15000);

  it('restores unmatched names when the picker is reopened after Cancel', async () => {
    render(
      <TestWrapper defaultLimit="web01,web02,db01">
        <PageFormLimitInput name="limit" label="Limit" placeholder="Enter limit" inventoryId={2} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));
    await waitForCheckedRows('db01');
    clickRemoveUnmatched('web01');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByTestId('limit-value')).toHaveTextContent('web01,web02,db01');

    fireEvent.click(screen.getByRole('button', { name: 'Browse hosts and groups' }));
    await waitFor(() => expect(screen.getByTestId('limit-unmatched-section')).toBeInTheDocument(), {
      timeout: 8000,
    });
    expect(screen.getByRole('button', { name: 'Remove web01 from Limit' })).toBeInTheDocument();
    expect(previewText()).toBe('web01,web02,db01');
  }, 25000);

  it('keeps unmatched names when applying a newly selected host without removing them', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02' });

    await waitFor(() => expect(rowCheckbox('db01')).toBeTruthy(), { timeout: 8000 });
    clickRowCheckbox('db01');
    expect(previewText()).toBe('web01,web02,db01');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('web01,web02,db01');
  }, 15000);

  it('preserves unmatched names when applying without changes', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02,db01' });

    await waitForCheckedRows('db01');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('web01,web02,db01');
  }, 15000);

  it('preserves advanced patterns when unmatched names are removed', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web*,web01,db01' });

    await waitForCheckedRows('db01');
    clickRemoveUnmatched('web01');
    expect(previewText()).toBe('web*,db01');
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('web*,db01');
  }, 15000);

  it('explains before applying when Limit would become empty', async () => {
    const { onApply } = renderDialog({ inventoryId: 2, currentLimit: 'web01,web02' });

    await waitFor(() => expect(screen.getByTestId('limit-unmatched-section')).toBeInTheDocument(), {
      timeout: 8000,
    });
    fireEvent.click(screen.getByTestId('limit-unmatched-remove-all'));
    expect(previewText()).toBe('(empty)');
    expect(screen.getByTestId('limit-empty-help')).toHaveTextContent(
      'An empty Limit adds no extra host restriction. When launched, the job can run on the hosts targeted by the playbook in the selected inventory.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('');
  }, 15000);

  it('shows a lookup error in the picker instead of treating names as missing', async () => {
    server.use(
      http.get(awxAPI`/inventories/1/hosts/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('name__in')) {
          return HttpResponse.json({ detail: 'Unable to query hosts' }, { status: 500 });
        }
        return HttpResponse.json(paginate(hostsFixture.results, url));
      })
    );
    const { onApply } = renderDialog({ currentLimit: 'web01,web02' });

    await waitFor(
      () => expect(screen.getByTestId('limit-picker-lookup-error')).toBeInTheDocument(),
      { timeout: 8000 }
    );
    expect(screen.queryByTestId('limit-unmatched-section')).not.toBeInTheDocument();
    await waitFor(() => expect(rowCheckbox('web01')).toBeTruthy(), { timeout: 8000 });
    expect(rowCheckbox('web01')).not.toBeChecked();
    expect(previewText()).toBe('web01,web02');

    fireEvent.click(screen.getByRole('button', { name: 'Apply selection' }));
    expect(onApply).toHaveBeenCalledWith('web01,web02');
  }, 15000);
});
