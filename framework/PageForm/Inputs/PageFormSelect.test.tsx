/* eslint-disable i18next/no-literal-string */
import { render, within, screen, waitFor } from '@testing-library/react';
import { PageFormSelect, PageFormSelectProps } from './PageFormSelect';
import { describe, expect, test, vi } from 'vitest';
import { useForm, FormProvider, FieldValues } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

function getToggle() {
  return document.getElementById('name-form-group-toggle') as HTMLButtonElement;
}

describe('PageFormSelect', () => {
  const options = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
    { label: 'Option C', value: 'C' },
  ];

  function Wrapper(
    props: Partial<PageFormSelectProps<FieldValues>> & { defaultValues?: Record<string, unknown> }
  ) {
    const { defaultValues = { name: 'A' }, ...selectProps } = props;
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <form onSubmit={() => methods.handleSubmit(() => {})}>
          <PageFormSelect name="name" label="Name" options={options} {...selectProps} />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }

  test('should render select options', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    const list = await screen.findByRole('listbox');
    expect(list).not.toBeNull();

    for (const option of options) {
      expect(within(list).getByText(option.label)).toBeInTheDocument();
    }
  });

  test('should render scrollable options', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    const menu = document.querySelector(
      'div.pf-m-scrollable[data-ouia-component-id="menu-select"]'
    );
    expect(menu).toBeInTheDocument();
  });

  test('should filter options via typeahead search', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    const list = await screen.findByRole('listbox');
    expect(within(list).getByText('Option A')).toBeInTheDocument();
    expect(within(list).getByText('Option B')).toBeInTheDocument();
    expect(within(list).getByText('Option C')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    await user.type(searchInput, 'Option B');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Option B')).toBeInTheDocument();
      expect(within(listbox).queryByText('Option A')).not.toBeInTheDocument();
      expect(within(listbox).queryByText('Option C')).not.toBeInTheDocument();
    });
  });

  test('should show no results when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    await user.type(searchInput, 'xyz');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  test('should select an option and call onChange', async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<Wrapper onChange={onChangeSpy} defaultValues={{ name: '' }} />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    await user.click(screen.getByText('Option B'));

    expect(onChangeSpy).toHaveBeenCalledWith('B');
    expect(getToggle()).toHaveTextContent('Option B');
  });

  test('should close dropdown after selecting an option', async () => {
    const user = userEvent.setup();
    render(<Wrapper defaultValues={{ name: '' }} />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    await user.click(screen.getByText('Option A'));

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  test('should clear search when dropdown is reopened', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    await user.type(searchInput, 'Option B');

    await waitFor(() => {
      expect(within(screen.getByRole('listbox')).queryByText('Option A')).not.toBeInTheDocument();
    });

    await user.click(getToggle());
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    await user.click(getToggle());
    await screen.findByRole('listbox');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Option A')).toBeInTheDocument();
      expect(within(listbox).getByText('Option B')).toBeInTheDocument();
      expect(within(listbox).getByText('Option C')).toBeInTheDocument();
    });
  });

  test('should clear search via the clear button', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    await user.type(searchInput, 'Option B');

    await waitFor(() => {
      expect(within(screen.getByRole('listbox')).queryByText('Option A')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(clearButton);

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Option A')).toBeInTheDocument();
      expect(within(listbox).getByText('Option B')).toBeInTheDocument();
      expect(within(listbox).getByText('Option C')).toBeInTheDocument();
    });
  });

  test('should display placeholder text when no value selected', () => {
    render(<Wrapper placeholderText="Choose one" defaultValues={{ name: '' }} />);

    expect(getToggle()).toHaveTextContent('Choose one');
  });

  test('should render footer when provided', async () => {
    const user = userEvent.setup();
    render(<Wrapper footer={<div>Custom Footer</div>} />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
  });

  test('should show results count when filtering', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    await user.type(searchInput, 'Option B');

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  test('should move focus from search to list on ArrowDown', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    searchInput.focus();

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const firstOption = within(listbox).getAllByRole('option')[0];
      expect(firstOption).toHaveFocus();
    });
  });

  test('should move focus from search to list on Tab', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    await screen.findByRole('listbox');

    const searchInput = screen.getByRole('textbox', { name: 'Search input' });
    searchInput.focus();

    await user.keyboard('{Tab}');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const firstOption = within(listbox).getAllByRole('option')[0];
      expect(firstOption).toHaveFocus();
    });
  });

  test('should move focus from list back to search on Tab', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.click(getToggle());
    const listbox = await screen.findByRole('listbox');

    const firstOption = within(listbox).getAllByRole('option')[0];
    firstOption.focus();

    await user.keyboard('{Tab}');

    await waitFor(() => {
      const searchInput = screen.getByRole('textbox', { name: 'Search input' });
      expect(searchInput).toHaveFocus();
    });
  });

  test('should auto-select single option when required', async () => {
    const singleOption = [{ label: 'Only Option', value: 'only' }];

    render(<Wrapper options={singleOption} isRequired defaultValues={{ name: '' }} />);

    await waitFor(() => {
      expect(getToggle()).toHaveTextContent('Only Option');
    });
  });

  test('should disable toggle when isDisabled is true', () => {
    render(<Wrapper isDisabled />);
    expect(getToggle()).toBeDisabled();
  });
});
