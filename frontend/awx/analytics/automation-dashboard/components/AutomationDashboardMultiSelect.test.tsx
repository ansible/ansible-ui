import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OPTION_RENDER_BATCH_SIZE } from '../common/useAutomationDashboardProgressiveOptions';
import {
  AutomationDashboardMultiSelect,
  AutomationDashboardMultiSelectProps,
  optionMatchesSearch,
} from './AutomationDashboardMultiSelect';
import { testOptions, TEST_MATCH_LABEL, TEST_SEARCH } from './asyncMultiSelect.testUtils';

const PLACEHOLDER = 'Select template';
const ARIA_EXPANDED = 'aria-expanded';
const SELECT_ALL = 'Select all';
const ARROW_DOWN = '{ArrowDown}';
/** A search no option matches. */
const NO_MATCH_SEARCH = 'missing';
const loadedOptions = testOptions.slice(0, 5);
const [firstOption, secondOption] = loadedOptions;

type StatefulProps = Partial<
  Omit<AutomationDashboardMultiSelectProps, 'open' | 'setOpen' | 'searchValue' | 'setSearchValue'>
> & { initialOpen?: boolean; initialSearch?: string };

/** Owns the open state, search and selection like `AutomationDashboardAsyncMultiSelectFilter`. */
function StatefulMultiSelect(props: Readonly<StatefulProps>) {
  const { initialOpen = true, initialSearch = '', values: initialValues, ...rest } = props;
  const [open, setOpen] = useState(initialOpen);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [values, setValues] = useState(initialValues);
  return (
    <AutomationDashboardMultiSelect
      id="multi"
      placeholder={PLACEHOLDER}
      options={loadedOptions}
      onSelectMatching={vi.fn()}
      {...rest}
      values={values}
      onSelect={(setter) => {
        setValues((previous) => setter(previous));
        rest.onSelect?.(setter);
      }}
      open={open}
      setOpen={setOpen}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />
  );
}

function renderMultiSelect(props: StatefulProps = {}) {
  const onSelect = vi.fn();
  render(<StatefulMultiSelect onSelect={onSelect} {...props} />);
  return { onSelect, user: userEvent.setup() };
}

function getToggle() {
  return screen.getByTestId('multi');
}

/** Renders the select; the returned function sets whether a bulk action loads. */
function renderBulkLoading(props: StatefulProps = {}) {
  const { rerender } = render(<StatefulMultiSelect {...props} />);
  return {
    user: userEvent.setup(),
    setSelectingAll: (isSelectingAll: boolean) =>
      rerender(<StatefulMultiSelect {...props} isSelectingAll={isSelectingAll} />),
  };
}

/** 450 options: two full batches of OPTION_RENDER_BATCH_SIZE and a partial one. */
const manyOptions = Array.from({ length: 450 }, (_, index) => ({
  label: `Option ${String(index + 1).padStart(3, '0')}`,
  value: String(index + 1),
}));

/** The select menu. */
function getMenu() {
  return document.getElementById('multi-select')!;
}

/** The rendered options of the menu (their list items). */
function getRenderedItems() {
  return document.querySelectorAll<HTMLLIElement>('#multi-select ul li');
}

/** The checkboxes of the rendered options. */
function getRenderedOptions() {
  return document.querySelectorAll<HTMLInputElement>('#multi-select ul li input');
}

function getOptionCheckbox(label: string) {
  return screen.getByLabelText(label);
}

/** Applies the last selection setter passed to `onSelect` to the given values. */
function lastSelection(onSelect: ReturnType<typeof vi.fn>, previous: string[] | undefined) {
  const setter = onSelect.mock.lastCall?.[0] as (values: string[] | undefined) => string[];
  return setter(previous);
}

describe('optionMatchesSearch', () => {
  it('matches every option for an empty search and the label case-insensitively otherwise', () => {
    expect(optionMatchesSearch(firstOption, '')).toBe(true);
    expect(optionMatchesSearch(firstOption, firstOption.label.toUpperCase())).toBe(true);
    expect(optionMatchesSearch(firstOption, NO_MATCH_SEARCH)).toBe(false);
  });

  it('trims the search like the dashboard API', () => {
    expect(optionMatchesSearch({ label: 'Template 10', value: '10' }, ' Template 1 ')).toBe(true);
    expect(optionMatchesSearch(firstOption, '   ')).toBe(true);
  });
});

describe('AutomationDashboardMultiSelect', () => {
  it('shows the placeholder while nothing is selected', () => {
    renderMultiSelect({ initialOpen: false });

    expect(getToggle()).toHaveTextContent(PLACEHOLDER);
  });

  it('shows the selected count, including selected values that are not loaded', () => {
    renderMultiSelect({ initialOpen: false, values: [firstOption.value, 'not-loaded'] });

    expect(getToggle()).toHaveTextContent('2 selected');
    expect(getToggle()).not.toHaveTextContent(PLACEHOLDER);
  });

  it('names the toggle by the filter label and the selection state', () => {
    const { rerender } = render(
      <AutomationDashboardMultiSelect
        id="multi"
        placeholder={PLACEHOLDER}
        label="Template"
        options={loadedOptions}
        values={[]}
        onSelect={vi.fn()}
        onSelectMatching={vi.fn()}
        open={false}
        setOpen={vi.fn()}
        searchValue=""
        setSearchValue={vi.fn()}
      />
    );
    expect(getToggle()).toHaveAccessibleName('Template: None selected');

    rerender(
      <AutomationDashboardMultiSelect
        id="multi"
        placeholder={PLACEHOLDER}
        label="Template"
        options={loadedOptions}
        values={[firstOption.value, secondOption.value]}
        onSelect={vi.fn()}
        onSelectMatching={vi.fn()}
        open={false}
        setOpen={vi.fn()}
        searchValue=""
        setSearchValue={vi.fn()}
        isSelectingAll
      />
    );
    expect(getToggle()).toHaveAccessibleName('Template: Loading...');
  });

  it('shows "All selected" instead of the count after "Select all" without a search', () => {
    renderMultiSelect({ initialOpen: false, values: [firstOption.value], allSelectedSearch: '' });

    expect(getToggle()).toHaveTextContent('All selected');
    expect(getToggle()).not.toHaveTextContent('1 selected');
  });

  it('shows "All N matching" after "Select all matching", also after the search is cleared', () => {
    renderMultiSelect({
      initialOpen: false,
      values: [firstOption.value, secondOption.value],
      allSelectedSearch: TEST_SEARCH,
    });

    expect(getToggle()).toHaveTextContent('All 2 matching');
    expect(getToggle()).toHaveAccessibleName('All 2 matching');
  });

  it.each([
    ['the search of "Select all"', TEST_SEARCH, 'Deselect all matching'],
    ['another search', 'other', 'Select all matching'],
  ])(
    'tells the bulk checkbox whether every option is selected for %s',
    (_, initialSearch, label) => {
      renderMultiSelect({
        values: loadedOptions.map((option) => option.value),
        allSelectedSearch: TEST_SEARCH,
        initialSearch,
        localFilter: '',
      });

      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  );

  it('opens and closes the menu with the toggle', async () => {
    const { user } = renderMultiSelect({ initialOpen: false });

    await user.click(getToggle());
    expect(getOptionCheckbox(firstOption.label)).toBeInTheDocument();

    await user.click(getToggle());
    await waitFor(() => expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'false'));
  });

  it('opens the menu and starts the search when typing on the toggle', async () => {
    const { user } = renderMultiSelect({ initialOpen: false });
    getToggle().focus();

    await user.keyboard('a');

    expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'true');
    expect(screen.getByLabelText('Search input')).toHaveValue('a');
  });

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('opens the menu with %s and moves the focus to the search', async (_key, keys) => {
    const { user } = renderMultiSelect({ initialOpen: false });
    getToggle().focus();

    await user.keyboard(keys);

    expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'true');
    const search = screen.getByLabelText('Search input');
    await waitFor(() => expect(search).toHaveFocus());
    expect(search).toHaveValue('');
  });

  it('reaches the bulk checkbox with Shift+Tab after opening the menu with the keyboard', async () => {
    const { user } = renderMultiSelect({ initialOpen: false });
    getToggle().focus();

    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByLabelText('Search input')).toHaveFocus());
    await user.keyboard('{Shift>}{Tab}{/Shift}');

    expect(screen.getByLabelText(SELECT_ALL)).toHaveFocus();
  });

  it('closes the open menu with Enter on the toggle', async () => {
    const { user } = renderMultiSelect();
    getToggle().focus();

    await user.keyboard('{Enter}');

    await waitFor(() => expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'false'));
  });

  it('does not replace the search when typing on the toggle of the open menu', async () => {
    const { user } = renderMultiSelect({ initialSearch: TEST_SEARCH });
    getToggle().focus();

    await user.keyboard('x');

    expect(screen.getByLabelText('Search input')).toHaveValue(TEST_SEARCH);
  });

  it('does not open the menu when typing on the toggle while a bulk action loads', async () => {
    const { user } = renderMultiSelect({ initialOpen: false, isSelectingAll: true });
    getToggle().focus();

    await user.keyboard('a');

    expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'false');
  });

  it('does not start a search with keys that do not type a character', async () => {
    const { user } = renderMultiSelect({ initialOpen: false });
    getToggle().focus();

    await user.keyboard('{Escape}{ArrowDown}');

    expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'false');
  });

  it('selects the clicked one of two options with the same label', async () => {
    const sameLabelOptions = [
      { label: 'Deploy', value: '3' },
      { label: 'Deploy', value: '7' },
    ];
    const { onSelect, user } = renderMultiSelect({ options: sameLabelOptions });

    await user.click(screen.getAllByText('Deploy')[1]);

    expect(lastSelection(onSelect, [])).toEqual(['7']);
  });

  it('checks the selected options', () => {
    renderMultiSelect({ values: [secondOption.value] });

    expect(getOptionCheckbox(secondOption.label)).toBeChecked();
    expect(getOptionCheckbox(firstOption.label)).not.toBeChecked();
  });

  it('adds an option to the selection when it is clicked', async () => {
    const { onSelect, user } = renderMultiSelect({ values: [secondOption.value] });

    await user.click(screen.getByText(firstOption.label));

    expect(lastSelection(onSelect, [secondOption.value])).toEqual([
      secondOption.value,
      firstOption.value,
    ]);
  });

  it('removes a selected option when it is clicked', async () => {
    const { onSelect, user } = renderMultiSelect({ values: [secondOption.value] });

    await user.click(screen.getByText(secondOption.label));

    expect(lastSelection(onSelect, [secondOption.value])).toEqual([]);
    expect(lastSelection(onSelect, undefined)).toEqual([secondOption.value]);
  });

  it('shows only the options matching the search, sorted by label', () => {
    renderMultiSelect({ options: testOptions, initialSearch: TEST_SEARCH });

    const labels = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(labels).toEqual([
      `${TEST_MATCH_LABEL} 12`,
      `${TEST_MATCH_LABEL} 3`,
      `${TEST_MATCH_LABEL} 7`,
    ]);
    expect(screen.queryByText(firstOption.label)).not.toBeInTheDocument();
  });

  it('shows "No results found" when no option matches', () => {
    renderMultiSelect({ initialSearch: NO_MATCH_SEARCH });

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows a spinner instead of "No results found" while loading without options', () => {
    renderMultiSelect({ options: [], isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  it('clears the search with the clear button', async () => {
    const { user } = renderMultiSelect({ initialSearch: NO_MATCH_SEARCH });

    await user.click(screen.getByLabelText('Reset'));

    expect(getOptionCheckbox(firstOption.label)).toBeInTheDocument();
    expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'true');
  });

  it('disables the options and the search while "Select all" loads', () => {
    renderMultiSelect({ isSelectingAll: true });

    expect(getOptionCheckbox(firstOption.label)).toBeDisabled();
    expect(screen.getByLabelText('Search input')).toBeDisabled();
  });

  it('disables the bulk checkbox while loading', () => {
    renderMultiSelect({ isLoading: true });

    expect(screen.getByLabelText(SELECT_ALL)).toBeDisabled();
  });

  it('clears the selection with "Deselect all"', async () => {
    const allValues = loadedOptions.map((option) => option.value);
    const { onSelect, user } = renderMultiSelect({ values: allValues, isEveryOptionLoaded: true });

    await user.click(screen.getByLabelText('Deselect all'));

    expect(lastSelection(onSelect, allValues)).toEqual([]);
  });

  it.each([
    ['all', '', SELECT_ALL],
    ['selectMatching', TEST_SEARCH, 'Select all matching'],
  ] as const)(
    'passes "%s" from the bulk checkbox to onSelectMatching',
    async (mode, initialSearch, label) => {
      const onSelectMatching = vi.fn();
      const { user } = renderMultiSelect({
        onSelectMatching,
        values: [firstOption.value],
        initialSearch,
      });

      await user.click(screen.getByLabelText(label));

      expect(onSelectMatching).toHaveBeenCalledWith(mode);
    }
  );

  it('shows the footer', () => {
    renderMultiSelect({ footer: <span>Footer content</span> });

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('moves the focus from the search to the first option with arrow down', async () => {
    const { user } = renderMultiSelect();
    screen.getByLabelText('Search input').focus();

    await user.keyboard(ARROW_DOWN);

    expect(getOptionCheckbox(firstOption.label)).toHaveFocus();
  });

  it('moves with Tab and Shift+Tab between the bulk selector, the search, the options and the footer', async () => {
    const { user } = renderMultiSelect({ footer: <button type="button">Load more</button> });
    const search = screen.getByLabelText('Search input');
    search.focus();

    await user.keyboard('{Tab}');
    expect(getOptionCheckbox(firstOption.label)).toHaveFocus();
    await user.keyboard('{Tab}');
    expect(screen.getByText('Load more')).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(getOptionCheckbox(firstOption.label)).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(search).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByLabelText(SELECT_ALL)).toHaveFocus();
  });

  it('closes the menu and focuses the toggle when Tab leaves the last part of the menu', async () => {
    const { user } = renderMultiSelect();
    getOptionCheckbox(firstOption.label).focus();

    await user.keyboard('{Tab}');

    await waitFor(() => expect(getToggle()).toHaveAttribute(ARIA_EXPANDED, 'false'));
    expect(getToggle()).toHaveFocus();
  });

  it('sorts the options by label regardless of case', () => {
    renderMultiSelect({
      options: [
        { label: 'beta', value: 'b' },
        { label: 'Alpha', value: 'a' },
        { label: 'Gamma', value: 'g' },
        { label: 'delta', value: 'd' },
      ],
    });

    const labels = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(labels).toEqual(['Alpha', 'beta', 'delta', 'Gamma']);
  });

  // Many options in happy-dom: more time than the default 5 seconds for slower, parallel CI runs.
  describe('rendering many options in batches', { timeout: 15000 }, () => {
    it('renders the first batch of options', () => {
      renderMultiSelect({ options: manyOptions });

      expect(getRenderedOptions()).toHaveLength(OPTION_RENDER_BATCH_SIZE);
    });

    it('renders the next batch when the list is scrolled near its end', () => {
      // 5 pixels per rendered option, so the first batch is 1000 pixels high.
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
        this: HTMLElement
      ) {
        return this.tagName === 'UL' ? this.children.length * 5 : 0;
      });
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
      try {
        renderMultiSelect({ options: manyOptions });
        const scrollContainer = document.querySelector('#multi-select ul')!.parentElement!;
        expect(getRenderedOptions()).toHaveLength(OPTION_RENDER_BATCH_SIZE);

        Object.defineProperty(scrollContainer, 'scrollTop', { value: 650, configurable: true });
        fireEvent.scroll(scrollContainer);

        expect(getRenderedOptions()).toHaveLength(2 * OPTION_RENDER_BATCH_SIZE);
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('renders the next batch and moves on with ArrowDown on the last rendered option', async () => {
      const { user } = renderMultiSelect({ options: manyOptions });
      const lastRendered = [...getRenderedOptions()].at(-1)!;
      lastRendered.focus();

      await user.keyboard(ARROW_DOWN);

      expect(getRenderedOptions()).toHaveLength(2 * OPTION_RENDER_BATCH_SIZE);
      expect(getOptionCheckbox(manyOptions[OPTION_RENDER_BATCH_SIZE].label)).toHaveFocus();
    });

    it('renders only the first batch again for a new search', async () => {
      const { user } = renderMultiSelect({ options: manyOptions });
      [...getRenderedOptions()].at(-1)!.focus();
      await user.keyboard(ARROW_DOWN);
      expect(getRenderedOptions()).toHaveLength(2 * OPTION_RENDER_BATCH_SIZE);

      await user.click(screen.getByLabelText('Search input'));
      await user.paste('Option');

      expect(getRenderedOptions()).toHaveLength(OPTION_RENDER_BATCH_SIZE);
    });

    it('renders only the first batch again when a queried search is cleared', async () => {
      // The options are the server's matches for the search: nothing is filtered locally.
      const { user } = renderMultiSelect({
        options: manyOptions,
        initialSearch: 'Option',
        localFilter: '',
      });
      [...getRenderedOptions()].at(-1)!.focus();
      await user.keyboard(ARROW_DOWN);
      expect(getRenderedOptions()).toHaveLength(2 * OPTION_RENDER_BATCH_SIZE);

      await user.click(screen.getByLabelText('Reset'));

      expect(getRenderedOptions()).toHaveLength(OPTION_RENDER_BATCH_SIZE);
    });
  });

  describe('rendered batches for keyboard and screen reader users', { timeout: 15000 }, () => {
    it('tells every rendered option its position in all the options', () => {
      renderMultiSelect({ options: manyOptions });

      const items = getRenderedItems();
      expect(items).toHaveLength(OPTION_RENDER_BATCH_SIZE);
      expect(items[0]).toHaveAttribute('aria-setsize', '450');
      expect(items[0]).toHaveAttribute('aria-posinset', '1');
      expect(items[OPTION_RENDER_BATCH_SIZE - 1]).toHaveAttribute(
        'aria-posinset',
        String(OPTION_RENDER_BATCH_SIZE)
      );
    });

    it('renders every option and moves to the last one with End', async () => {
      const { user } = renderMultiSelect({ options: manyOptions });
      getOptionCheckbox(manyOptions[0].label).focus();

      await user.keyboard('{End}');

      expect(getRenderedItems()).toHaveLength(manyOptions.length);
      expect(getOptionCheckbox(manyOptions[manyOptions.length - 1].label)).toHaveFocus();
    });
  });

  describe('focus while a bulk action loads', () => {
    it('keeps the focus of the bulk checkbox in the menu and gives it back afterwards', () => {
      const { setSelectingAll } = renderBulkLoading();
      const checkbox = screen.getByLabelText(SELECT_ALL);
      checkbox.focus();

      setSelectingAll(true);
      expect(getMenu()).toHaveFocus();

      setSelectingAll(false);
      expect(checkbox).toHaveFocus();
    });

    it('keeps the focus of a disabled option in the menu and gives it to the bulk checkbox afterwards', () => {
      const { setSelectingAll } = renderBulkLoading();
      getOptionCheckbox(firstOption.label).focus();

      setSelectingAll(true);
      expect(getMenu()).toHaveFocus();

      setSelectingAll(false);
      expect(screen.getByLabelText(SELECT_ALL)).toHaveFocus();
    });

    it('moves the focus from the menu to the first enabled part with Tab', async () => {
      const { user, setSelectingAll } = renderBulkLoading({
        footer: <button type="button">Load more</button>,
      });
      screen.getByLabelText(SELECT_ALL).focus();
      setSelectingAll(true);

      await user.keyboard('{Tab}');

      expect(screen.getByText('Load more')).toHaveFocus();
    });

    it('keeps and gives back the focus with an id that is not a valid CSS selector', () => {
      const { setSelectingAll } = renderBulkLoading({ id: 'multi:1.a' });
      const checkbox = screen.getByLabelText(SELECT_ALL);
      checkbox.focus();

      setSelectingAll(true);
      expect(document.getElementById('multi:1.a-select')).toHaveFocus();

      setSelectingAll(false);
      expect(checkbox).toHaveFocus();
    });

    it('does not take the focus from outside the menu', () => {
      const { setSelectingAll } = renderBulkLoading();
      const outside = document.createElement('button');
      document.body.append(outside);
      outside.focus();

      setSelectingAll(true);

      expect(outside).toHaveFocus();
      outside.remove();
    });
  });

  it('shows a spinner in the toggle while a bulk action loads, also when closed', () => {
    renderMultiSelect({ initialOpen: false, values: [firstOption.value], isSelectingAll: true });

    expect(within(getToggle()).getByLabelText('Loading...')).toBeInTheDocument();
    expect(getToggle()).not.toHaveTextContent('1 selected');
  });

  it('shows the toggle in the danger status when there is an error', () => {
    renderMultiSelect({ initialOpen: false, hasError: true });

    expect(getToggle()).toHaveClass('pf-m-danger');
  });
});
