/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, RefObject, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageSelectOption } from './PageSelectOption';
import {
  PageSingleSelect,
  PageSingleSelectList,
  usePageSingleSelectContext,
} from './PageSingleSelect';

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
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options.slice(0, 8)} />);

    const toggle = screen.getByRole('button', { name: placeholderText });
    await user.click(toggle);
    await user.keyboard('o');

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

  it('does not open on Tab when pressing keys on the toggle', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options.slice(0, 5)} />);

    const toggle = screen.getByRole('button', { name: placeholderText });
    toggle.focus();
    await user.keyboard('{Tab}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters options externally when search value is controlled', async () => {
    const user = userEvent.setup();
    function ControlledHarness() {
      const [search, setSearch] = useState('');
      return (
        <PageSection hasBodyWrapper={false}>
          <PageSingleSelect
            id="controlled-search"
            placeholder={placeholderText}
            value={null}
            onSelect={vi.fn()}
            options={options}
            searchValue={search}
            setSearchValue={setSearch}
          />
        </PageSection>
      );
    }

    render(<ControlledHarness />);
    await user.click(screen.getByRole('button', { name: placeholderText }));
    const searchInput = await screen.findByTestId('search-input');
    const input = searchInput.querySelector('input')!;
    await user.type(input, 'Option 3');
    expect(input).toHaveValue('Option 3');
    expect(screen.getByText('Option 0')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('focuses the first option when ArrowDown is pressed in the search input', async () => {
    const user = userEvent.setup();
    render(<PageSingleSelectTest placeholder={placeholderText} options={options.slice(0, 3)} />);

    await user.click(screen.getByRole('button', { name: placeholderText }));
    const searchInput = await screen.findByTestId('search-input');
    const input = searchInput.querySelector('input')!;
    input.focus();
    await user.keyboard('{ArrowDown}');

    const firstOption = document.querySelector('li button:not(:disabled)');
    expect(firstOption).toHaveFocus();
  });

  it('returns context open state from usePageSingleSelectContext', () => {
    function ContextReadout() {
      const { open } = usePageSingleSelectContext();
      return <span data-testid="open-state">{open ? 'open' : 'closed'}</span>;
    }

    render(
      <PageSection hasBodyWrapper={false}>
        <PageSingleSelect
          id="context"
          placeholder={placeholderText}
          value={null}
          onSelect={vi.fn()}
          options={options.slice(0, 1)}
          open
          footer={<ContextReadout />}
        />
      </PageSection>
    );

    expect(screen.getByTestId('open-state')).toHaveTextContent('open');
  });

  it('returns focus to the search input when tabbing within the option list', async () => {
    const user = userEvent.setup();
    const searchRef = { current: document.createElement('input') };
    document.body.appendChild(searchRef.current);
    const focusSpy = vi.spyOn(searchRef.current, 'focus');

    render(
      <PageSingleSelectList
        searchRef={searchRef as RefObject<HTMLInputElement>}
        options={[{ label: 'Alpha', value: 'a' }]}
      />
    );

    const list = screen.getByRole('menu');
    list.focus();
    await user.keyboard('{Tab}');
    expect(focusSpy).toHaveBeenCalled();
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
