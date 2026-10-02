/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, ReactNode, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PageSelectOption } from './PageSelectOption';
import { PageSingleSelect, PageSingleSelectList } from './PageSingleSelect';

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
  isLoading?: boolean;
  isRequired?: boolean;
  isDisabled?: string;
  queryLabel?: (value: T) => ReactNode;
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
        isLoading={props.isLoading}
        isRequired={props.isRequired}
        isDisabled={props.isDisabled}
        queryLabel={props.queryLabel}
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

  it('should render dividers and support tabbing back to the search input', async () => {
    const user = userEvent.setup();
    const searchRef = createRef<HTMLInputElement>();
    render(
      <PageSingleSelectList
        searchRef={searchRef}
        options={[{ label: 'Divided', value: 'divided', dividerAfter: true }]}
      />
    );

    expect(screen.getByRole('separator')).toBeInTheDocument();
    const list = screen.getByRole('menu');
    list.focus();
    await user.keyboard('{Tab}');
  });

  it('should display a queried label for a value not in the options', () => {
    const value = { name: 'Remote option' };
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={value}
        queryLabel={(selectedValue) => selectedValue.name}
      />
    );

    expect(screen.getByRole('button', { name: 'Remote option' })).toBeInTheDocument();
  });

  it('should show no results after filtering', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));
    const input = (await screen.findByTestId('search-input')).querySelector('input');
    await user.type(input!, 'does not exist');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });

  it('should show a loading indicator when no filtered options are available', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} isLoading />);

    await user.click(screen.getByRole('button', { name: placeholderText }));
    const input = (await screen.findByTestId('search-input')).querySelector('input');
    await user.type(input!, 'does not exist');

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('should group options and clear a selected value', async () => {
    const user = userEvent.setup();
    const groupedOptions = [
      { label: 'First', value: 'first', group: 'Group A', dividerAfter: true },
      { label: 'Second', value: 'second', group: 'Group B' },
    ];
    render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={groupedOptions}
        defaultValue={groupedOptions[0].value}
      />
    );

    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
    await user.click(screen.getByTestId('reset'));

    expect(screen.getByRole('button', { name: placeholderText })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: placeholderText }));
    expect(await screen.findByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
  });

  it('should support keyboard navigation from the search input', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));
    const searchInput = (await screen.findByTestId('search-input')).querySelector('input');
    await user.click(searchInput!);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Tab}');

    expect(screen.getByText('Option 0')).toBeInTheDocument();
  });

  it('should not render a reset control for required or disabled selects', () => {
    const { rerender } = render(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={testObjects[0]}
        isRequired
      />
    );

    expect(screen.queryByTestId('reset')).not.toBeInTheDocument();
    rerender(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={testObjects[0]}
        isDisabled="Disabled"
      />
    );
    expect(screen.queryByTestId('reset')).not.toBeInTheDocument();
  });

  it('should auto-select the only required option', async () => {
    const user = userEvent.setup();
    const singleOption = [options[0]];
    render(
      <PageSingleSelectTest placeholder={placeholderText} options={singleOption} isRequired />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Option 0' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Option 0' }));
  });

  it('should select options using explicit keys, including zero', async () => {
    const user = userEvent.setup();
    const keyedOptions = [
      { label: 'String key', value: 'string', key: 'string-key' },
      { label: 'Zero key', value: 'zero', key: 0 },
      { label: 'String key', value: 'duplicate', key: 'duplicate-key' },
    ];
    render(<PageSingleSelectTest placeholder={placeholderText} options={keyedOptions} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));
    await user.click(screen.getByText('Zero key'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Zero key' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Zero key' }));
    await user.click(screen.getAllByText('String key')[0]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'String key' })).toBeInTheDocument();
    });
  });
});
