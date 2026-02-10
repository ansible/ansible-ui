/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { describe, expect, it } from 'vitest';
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
});
