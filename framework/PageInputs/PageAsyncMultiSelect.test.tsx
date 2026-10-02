/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageAsyncMultiSelect, PageAsyncMultiSelectProps } from './PageAsyncMultiSelect';
import { PageAsyncSelectQueryOptions, PageAsyncSelectQueryResult } from './PageAsyncSelectOptions';

const asyncSelectTestOptions = new Array(50).fill(0).map((_, index) => ({
  value: index + 1,
  label: `Option ${index + 1}`,
  description: `Description ${index + 1}`,
}));

function asyncSelectTestQuery(
  queryOptions: PageAsyncSelectQueryOptions
): Promise<PageAsyncSelectQueryResult<number>> {
  const pageSize = queryOptions.pageSize ?? 10;
  const searchedOptions = asyncSelectTestOptions.filter((option) => {
    if (!queryOptions.search) return true;
    return option.label.includes(queryOptions.search);
  });
  const page = queryOptions.next ? Number(queryOptions.next) : 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const options = searchedOptions.slice(start, end);
  return Promise.resolve({
    options,
    remaining: Math.max(0, searchedOptions.length - end),
    next: page + 1,
  });
}

function asyncSelectTestQueryLabel(value: number): ReactNode {
  return `Option ${value}`;
}

function PageAsyncMultiSelectTest(
  props: Omit<
    PageAsyncMultiSelectProps<number>,
    'values' | 'onSelect' | 'placeholder' | 'queryLabel'
  > & {
    defaultValues?: number[];
  }
) {
  const { defaultValues, ...rest } = props;
  const [values, setValues] = useState<number[] | undefined>(() => defaultValues);
  return (
    <PageSection hasBodyWrapper={false}>
      <PageAsyncMultiSelect<number>
        {...rest}
        id="test"
        values={values}
        onSelect={setValues}
        placeholder="Select value"
        queryLabel={asyncSelectTestQueryLabel}
      />
    </PageSection>
  );
}

describe('PageAsyncMultiSelect', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    // Flush all pending timers to prevent async cleanup errors
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  it('should show queried options', async () => {
    const user = userEvent.setup();
    const { container } = render(<PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} />);

    const toggle = container.querySelector('#test');
    expect(toggle).toBeInTheDocument();

    await user.click(toggle!);

    // Wait for options to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('should show query error', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageAsyncMultiSelectTest
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error('Test error');
        }}
      />
    );

    const toggle = container.querySelector('#test');
    await user.click(toggle!);

    await waitFor(() => {
      expect(screen.getByText('Error loading options')).toBeInTheDocument();
    });
  });

  it('should show initial values', async () => {
    render(<PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} defaultValues={[1, 2]} />);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('does not show Load all by default', async () => {
    const user = userEvent.setup();
    const { container } = render(<PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} />);

    await user.click(container.querySelector('#test')!);
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('load-all')).not.toBeInTheDocument();
  });

  it('Load all fetches every remaining page when enabled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} showLoadAll />
    );

    await user.click(container.querySelector('#test')!);
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 50')).not.toBeInTheDocument();
    });

    await user.click(await screen.findByTestId('load-all'));
    await waitFor(() => {
      expect(screen.getByText('Option 50')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('load-all')).not.toBeInTheDocument();
    });
  });

  it('Load all uses loadAllPageSize for each request', async () => {
    const user = userEvent.setup();
    const queryOptions = vi.fn(asyncSelectTestQuery);
    const { container } = render(
      <PageAsyncMultiSelectTest queryOptions={queryOptions} showLoadAll loadAllPageSize={50} />
    );

    await user.click(container.querySelector('#test')!);
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    queryOptions.mockClear();
    await user.click(await screen.findByTestId('load-all'));
    await waitFor(() => {
      expect(screen.getByText('Option 50')).toBeInTheDocument();
    });

    expect(queryOptions).toHaveBeenCalled();
    expect(queryOptions.mock.calls.every((call) => call[0].pageSize === 50)).toBe(true);
    // One request is enough when page size covers the full set.
    expect(queryOptions).toHaveBeenCalledTimes(1);
  });
});
