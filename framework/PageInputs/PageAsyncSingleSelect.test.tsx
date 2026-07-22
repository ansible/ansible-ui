/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageAsyncSelectQueryOptions, PageAsyncSelectQueryResult } from './PageAsyncSelectOptions';
import { PageAsyncSingleSelect, PageAsyncSingleSelectProps } from './PageAsyncSingleSelect';

export const asyncSelectTestOptions = new Array(50).fill(0).map((_, index) => ({
  value: index + 1,
  label: `Option ${index + 1}`,
  description: `Description ${index + 1}`,
}));

export function asyncSelectTestQuery(
  queryOptions: PageAsyncSelectQueryOptions
): Promise<PageAsyncSelectQueryResult<number>> {
  const pageSize = 10;
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
    remaining: searchedOptions.length - end,
    next: page + 1,
  });
}

export function asyncSelectTestQueryLabel(value: number): ReactNode {
  return `Option ${value}`;
}

function PageAsyncSingleSelectTest(
  props: Omit<
    PageAsyncSingleSelectProps<number>,
    'value' | 'onSelect' | 'placeholder' | 'queryLabel'
  > & {
    defaultValue?: number;
  }
) {
  const { defaultValue, ...rest } = props;
  const [value, setValue] = useState<number | undefined | null>(() => defaultValue);
  return (
    <PageSection hasBodyWrapper={false}>
      <PageAsyncSingleSelect<number>
        {...rest}
        id="test"
        value={value}
        onSelect={setValue}
        placeholder="Select value"
        queryLabel={asyncSelectTestQueryLabel}
      />
    </PageSection>
  );
}

const unsortedOptionsQuery = (): Promise<{
  options: { value: number; label: string }[];
  remaining: number;
  next: number;
}> =>
  Promise.resolve({
    options: [
      { value: 3, label: 'Zebra' },
      { value: 1, label: 'Apple' },
      { value: 2, label: 'Mango' },
    ],
    remaining: 0,
    next: 2,
  });

describe('PageAsyncSingleSelect', () => {
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
    render(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} />);

    expect(screen.getByText('Select value')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('should show query error', async () => {
    const user = userEvent.setup();
    render(
      <PageAsyncSingleSelectTest
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error('Test error');
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Error loading options')).toBeInTheDocument();
    });
  });

  it('should show initial value', async () => {
    render(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} defaultValue={1} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Option 1' })).toBeInTheDocument();
    });
  });

  it('should show initial value even if option is not in first queried result', async () => {
    render(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} defaultValue={11} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Option 11' })).toBeInTheDocument();
    });
  });

  it('should sort options alphabetically by default', async () => {
    const user = userEvent.setup();

    render(<PageAsyncSingleSelectTest queryOptions={unsortedOptionsQuery} />);
    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Apple');
    expect(options[1]).toHaveTextContent('Mango');
    expect(options[2]).toHaveTextContent('Zebra');
  });

  it('should preserve original order when disableSortOptions is true', async () => {
    const user = userEvent.setup();

    render(<PageAsyncSingleSelectTest queryOptions={unsortedOptionsQuery} disableSortOptions />);
    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Zebra')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Zebra');
    expect(options[1]).toHaveTextContent('Apple');
    expect(options[2]).toHaveTextContent('Mango');
  });

  it('should sort options when disableSortOptions is false', async () => {
    const user = userEvent.setup();

    render(
      <PageAsyncSingleSelectTest queryOptions={unsortedOptionsQuery} disableSortOptions={false} />
    );
    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Apple');
    expect(options[1]).toHaveTextContent('Mango');
    expect(options[2]).toHaveTextContent('Zebra');
  });

  it('should deduplicate options while preserving order when disableSortOptions is true', async () => {
    const user = userEvent.setup();
    const duplicateQuery = (): Promise<{
      options: { value: number; label: string }[];
      remaining: number;
      next: number;
    }> =>
      Promise.resolve({
        options: [
          { value: 1, label: 'First' },
          { value: 2, label: 'Second' },
          { value: 1, label: 'First Duplicate' },
          { value: 3, label: 'Third' },
        ],
        remaining: 0,
        next: 2,
      });

    render(<PageAsyncSingleSelectTest queryOptions={duplicateQuery} disableSortOptions />);
    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('First');
    expect(options[1]).toHaveTextContent('Second');
    expect(options[2]).toHaveTextContent('Third');
  });

  it('should auto-select the only option when remaining is 0 and disableSortOptions is true', async () => {
    const user = userEvent.setup();
    const singleOptionQuery = (): Promise<{
      options: { value: number; label: string }[];
      remaining: number;
      next: number;
    }> =>
      Promise.resolve({
        options: [{ value: 42, label: 'Only Option' }],
        remaining: 0,
        next: 2,
      });

    render(<PageAsyncSingleSelectTest queryOptions={singleOptionQuery} disableSortOptions />);

    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Only Option' })).toBeInTheDocument();
    });
  });

  it('should pass disableSortOptions prop to the underlying PageSingleSelect', async () => {
    const user = userEvent.setup();
    const unsortedQuery = (): Promise<{
      options: { value: number; label: string }[];
      remaining: number;
      next: number;
    }> =>
      Promise.resolve({
        options: [
          { value: 1, label: 'Charlie' },
          { value: 2, label: 'Alpha' },
          { value: 3, label: 'Bravo' },
        ],
        remaining: 0,
        next: 2,
      });

    render(<PageAsyncSingleSelectTest queryOptions={unsortedQuery} disableSortOptions />);
    await user.click(screen.getByRole('button', { name: 'Select value' }));

    await waitFor(() => {
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Charlie');
    expect(options[1]).toHaveTextContent('Alpha');
    expect(options[2]).toHaveTextContent('Bravo');

    await user.click(screen.getByText('Alpha'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
    });
  });
});
