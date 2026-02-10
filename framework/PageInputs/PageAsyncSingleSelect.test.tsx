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
});
