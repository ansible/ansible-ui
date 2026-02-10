/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PageSelectOption } from './PageSelectOption';
import { PageSingleSelect } from './PageSingleSelect';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(20).fill(0).map((_, index) => ({
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  value: testObject,
  label: testObject.name,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';

function PageSingleSelectTest<T>(props: {
  placeholder: string;
  defaultValue?: T | null;
  options: PageSelectOption<T>[];
  footer?: ReactNode;
}) {
  const { placeholder, defaultValue, options } = props;
  const [value, setValue] = useState(() => defaultValue);
  return (
    <PageSection hasBodyWrapper={false}>
      <PageSingleSelect
        id="test"
        value={value}
        placeholder={placeholder}
        options={options}
        onSelect={setValue}
        footer={props.footer}
      />
    </PageSection>
  );
}

describe('PageSingleSelect', () => {
  it('should display placeholder', () => {
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);
    expect(screen.getByRole('button', { name: placeholderText })).toBeInTheDocument();
  });

  it('should display the initial value', () => {
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={testObjects[0]}
      />
    );
    expect(screen.getByRole('button', { name: testObjects[0].name })).toBeInTheDocument();
  });

  it('should show options when clicking on the dropdown toggle', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));

    await waitFor(() => {
      expect(screen.getByText(testObjects[0].name)).toBeInTheDocument();
      expect(screen.getByText(testObjects[1].name)).toBeInTheDocument();
    });
  });

  it('should select an option when clicking on it', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);

    // Initially shows placeholder
    expect(screen.getByRole('button', { name: placeholderText })).toBeInTheDocument();

    // Open dropdown and select first option
    await user.click(screen.getByRole('button', { name: placeholderText }));
    await user.click(screen.getByText(testObjects[0].name));

    // Should show selected value
    await waitFor(() => {
      expect(screen.getByRole('button', { name: testObjects[0].name })).toBeInTheDocument();
    });

    // Select another option
    await user.click(screen.getByRole('button', { name: testObjects[0].name }));
    await user.click(screen.getByText(testObjects[1].name));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: testObjects[1].name })).toBeInTheDocument();
    });
  });

  it('should support filtering options when more than 10 items', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));

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
    render(
      <PageSingleSelectTest placeholder={placeholderText} options={options} footer="Footer" />
    );

    await user.click(screen.getByRole('button', { name: placeholderText }));

    await waitFor(() => {
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
