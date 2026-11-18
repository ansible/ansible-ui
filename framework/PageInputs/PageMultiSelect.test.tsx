/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageMultiSelect } from './PageMultiSelect';
import { PageSelectOption } from './PageSelectOption';

interface ITestObject {
  id: number;
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(12).fill(0).map((_, index) => ({
  id: index,
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  label: testObject.name,
  value: testObject,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';

function PageMultiSelectTest<T>(props: {
  placeholder?: string;
  defaultValues?: T[];
  options: PageSelectOption<T>[];
  footer?: ReactNode;
  variant?: 'chips' | 'count';
  compareOptionValues?: (a: T, b: T) => boolean;
}) {
  const {
    placeholder,
    defaultValues: defaultValue,
    options,
    footer,
    compareOptionValues,
    variant,
  } = props;
  const [values, setValues] = useState<T[] | undefined>(() => defaultValue);
  return (
    <PageSection hasBodyWrapper={false}>
      <PageMultiSelect
        id="test"
        values={values}
        placeholder={placeholder}
        options={options}
        onSelect={setValues}
        footer={footer}
        compareOptionValues={compareOptionValues}
        variant={variant}
      />
    </PageSection>
  );
}

describe('PageMultiSelect', () => {
  it('should show placeholder', () => {
    render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );
    expect(screen.getByText(placeholderText)).toBeInTheDocument();
  });

  it('should show initial value', () => {
    render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValues={testObjects}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    // Check some of the selected options are visible as chips
    expect(screen.getByText(testObjects[0].name)).toBeInTheDocument();
    expect(screen.getByText(testObjects[1].name)).toBeInTheDocument();
  });

  it('select and unselect options', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    // Initially shows placeholder
    expect(screen.getByText(placeholderText)).toBeInTheDocument();

    // Open dropdown
    const toggle = container.querySelector('#test');
    expect(toggle).toBeInTheDocument();
    await user.click(toggle!);

    // Wait for first option to appear and click it
    await waitFor(() => {
      expect(screen.getByText(testObjects[0].name)).toBeInTheDocument();
    });
    await user.click(screen.getByText(testObjects[0].name));

    // Should show selected value (chips appear)
    await waitFor(() => {
      const chips = container.querySelectorAll('.pf-v6-c-label');
      expect(chips.length).toBeGreaterThan(0);
    });

    // Select second option - but first we need to re-open the dropdown if it closed
    // Click the second option
    await user.click(screen.getByText(testObjects[1].name));

    // Verify we now have 2 chips
    await waitFor(() => {
      const chips = container.querySelectorAll('.pf-v6-c-label');
      expect(chips.length).toBe(2);
    });
  });

  it('should support filtering options when more than 10 items', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    const toggle = container.querySelector('#test');
    await user.click(toggle!);

    // Wait for dropdown to be open and search input to appear
    const searchInput = await screen.findByTestId('search-input');
    expect(searchInput).toBeInTheDocument();

    // Type in the search input inside the search wrapper
    const inputElement = searchInput.querySelector('input');
    expect(inputElement).toBeInTheDocument();
    await user.type(inputElement!, 'Option 1');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 10')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('should show footer', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        footer="Footer"
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    const toggle = container.querySelector('#test');
    await user.click(toggle!);

    await waitFor(() => {
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  it('should show badge count', () => {
    render(
      <PageMultiSelectTest
        variant="count"
        placeholder={placeholderText}
        options={options}
        defaultValues={testObjects}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );
    expect(screen.getByText('12 selected')).toBeInTheDocument();
  });

  it('clears selection using the clear icon', async () => {
    const user = userEvent.setup();
    render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValues={[testObjects[0]]}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    const clearIcon = document.querySelector('[aria-hidden="true"][role="button"]');
    expect(clearIcon).toBeTruthy();
    await user.click(clearIcon!);

    expect(screen.getByText(placeholderText)).toBeInTheDocument();
  });

  it('removes a chip when its close button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValues={[testObjects[0], testObjects[1]]}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    expect(container.querySelectorAll('.pf-v6-c-label')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /close Option 0/i }));
    expect(container.querySelectorAll('.pf-v6-c-label')).toHaveLength(1);
  });

  it('shows grouped options in the menu', async () => {
    const user = userEvent.setup();
    const groupedOptions: PageSelectOption<ITestObject>[] = [
      { label: 'Grouped', value: testObjects[0], group: 'Group A' },
      { label: 'Other', value: testObjects[1], group: 'Group B' },
    ];

    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={groupedOptions}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    await user.click(container.querySelector('#test')!);
    expect(await screen.findByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
  });

  it('shows loading spinner when there are no visible options', () => {
    render(
      <PageMultiSelect
        id="loading"
        placeholder="Pick"
        values={[]}
        onSelect={vi.fn()}
        options={[]}
        isLoading
        open
      />
    );

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });

  it('renders query labels for values missing from options', () => {
    render(
      <PageMultiSelect<number>
        id="query-label"
        placeholder="Pick"
        values={[99]}
        onSelect={vi.fn()}
        options={[]}
        queryLabel={(value) => `Value ${value}`}
      />
    );

    expect(screen.getByText('Value 99')).toBeInTheDocument();
  });

  it('opens the menu and seeds search when typing on the toggle', async () => {
    const { container } = render(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options.slice(0, 8)}
        compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
      />
    );

    const toggle = container.querySelector('#test')!;
    fireEvent.keyDown(toggle, { key: 'o' });

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  it('hides clear-all icon when disableClearSelection is set', () => {
    render(
      <PageSection hasBodyWrapper={false}>
        <PageMultiSelect
          id="no-clear"
          placeholder={placeholderText}
          options={options}
          values={[testObjects[0]]}
          onSelect={vi.fn()}
          disableClearSelection
          compareOptionValues={(a: ITestObject, b: ITestObject) => a.id === b.id}
        />
      </PageSection>
    );

    expect(document.querySelector('[aria-hidden="true"][role="button"]')).not.toBeInTheDocument();
  });

  it('disables the toggle when isDisabled is set', () => {
    render(
      <PageSection hasBodyWrapper={false}>
        <PageMultiSelect
          id="disabled"
          placeholder={placeholderText}
          options={options}
          values={[]}
          onSelect={vi.fn()}
          isDisabled="Unavailable"
        />
      </PageSection>
    );

    expect(screen.getByRole('button', { name: placeholderText })).toBeDisabled();
  });
});
