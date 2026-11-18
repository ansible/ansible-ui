/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
  isRequired?: boolean;
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
        isRequired={props.isRequired}
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

  it('should auto-select the only option when required', async () => {
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={[{ value: testObjects[0], label: testObjects[0].name }]}
        isRequired
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: testObjects[0].name })).toBeInTheDocument();
    });
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

  it('should show grouped options', async () => {
    const user = userEvent.setup();
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={[{ value: testObjects[0], label: testObjects[0].name, group: 'Group' }]}
      />
    );

    await user.click(screen.getByRole('button', { name: placeholderText }));

    expect(await screen.findByText(testObjects[0].name)).toBeInTheDocument();
  });

  it('clears the selected value with the reset control', async () => {
    const user = userEvent.setup();
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={testObjects[0]}
      />
    );

    await user.click(screen.getByTestId('reset'));
    expect(screen.getByRole('button', { name: placeholderText })).toBeInTheDocument();
  });

  it('shows query label for selected values missing from options', () => {
    render(
      <PageSection hasBodyWrapper={false}>
        <PageSingleSelect
          id="query-label"
          placeholder={placeholderText}
          value={99}
          onSelect={vi.fn()}
          options={[]}
          queryLabel={(value) => `Custom ${value}`}
        />
      </PageSection>
    );

    expect(screen.getByRole('button', { name: 'Custom 99' })).toBeInTheDocument();
  });

  it('shows loading state when no results and isLoading is true', async () => {
    const user = userEvent.setup();
    render(
      <PageSection hasBodyWrapper={false}>
        <PageSingleSelect
          id="loading"
          placeholder={placeholderText}
          value={null}
          onSelect={vi.fn()}
          options={[]}
          isLoading
        />
      </PageSection>
    );

    await user.click(screen.getByRole('button', { name: placeholderText }));
    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });

  it('opens typeahead when typing on the toggle', async () => {
    render(<PageSingleSelectTest placeholder={placeholderText} options={options.slice(0, 8)} />);

    const toggle = screen.getByRole('button', { name: placeholderText });
    fireEvent.keyDown(toggle, { key: 'o' });

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  it('shows a custom no-results message', async () => {
    const user = userEvent.setup();
    render(
      <PageSection hasBodyWrapper={false}>
        <PageSingleSelect
          id="no-results"
          placeholder={placeholderText}
          value={null}
          onSelect={vi.fn()}
          options={options}
          noResultsMessage="Nothing here"
        />
      </PageSection>
    );

    await user.click(screen.getByRole('button', { name: placeholderText }));
    const searchInput = await screen.findByTestId('search-input');
    await user.type(searchInput.querySelector('input')!, 'zzzznotfound');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('selects options using option keys', async () => {
    const user = userEvent.setup();
    const keyOptions = [{ label: 'Keyed', value: testObjects[5], key: 'k5' }];
    function Harness() {
      const [value, setValue] = useState<ITestObject | null>(null);
      return (
        <PageSection hasBodyWrapper={false}>
          <PageSingleSelect
            id="keyed"
            placeholder={placeholderText}
            value={value}
            onSelect={setValue}
            options={keyOptions}
          />
        </PageSection>
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: placeholderText }));
    await user.click(screen.getByText('Keyed'));
    expect(screen.getByRole('button', { name: 'Keyed' })).toBeInTheDocument();
  });

  it('disables the toggle when isDisabled is provided', () => {
    render(
      <PageSection hasBodyWrapper={false}>
        <PageSingleSelect
          id="disabled"
          placeholder={placeholderText}
          value={null}
          onSelect={vi.fn()}
          options={options}
          isDisabled="Disabled reason"
        />
      </PageSection>
    );

    expect(screen.getByRole('button', { name: placeholderText })).toBeDisabled();
  });
});
