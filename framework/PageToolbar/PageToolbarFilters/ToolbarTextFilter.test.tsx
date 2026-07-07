/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToolbarTextMultiFilter, ToolbarSingleTextFilter } from './ToolbarTextFilter';

describe('ToolbarTextMultiFilter', () => {
  it('should call addFilter and clear input on Enter key', async () => {
    const user = userEvent.setup();
    const addFilter = vi.fn();

    render(<ToolbarTextMultiFilter addFilter={addFilter} comparison="contains" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello{Enter}');

    expect(addFilter).toHaveBeenCalledWith('hello');
    expect(input).toHaveValue('');
  });

  it('should call addFilter on apply button click', async () => {
    const user = userEvent.setup();
    const addFilter = vi.fn();

    render(<ToolbarTextMultiFilter addFilter={addFilter} comparison="contains" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    await user.click(screen.getByRole('button', { name: 'apply filter' }));

    expect(addFilter).toHaveBeenCalledWith('test');
    expect(input).toHaveValue('');
  });

  it('should disable apply when empty', () => {
    render(<ToolbarTextMultiFilter addFilter={vi.fn()} comparison="contains" />);

    expect(screen.getByRole('button', { name: 'apply filter' })).toBeDisabled();
  });

  it('should show clear button and clear input on click', async () => {
    const user = userEvent.setup();

    render(<ToolbarTextMultiFilter addFilter={vi.fn()} comparison="contains" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'value');

    const clearButton = screen.getByRole('button', { name: 'clear filter' });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(input).toHaveValue('');
  });

  it('should use comparison-based placeholder when no custom placeholder', () => {
    render(<ToolbarTextMultiFilter addFilter={vi.fn()} comparison="startsWith" />);

    expect(screen.getByPlaceholderText('starts with')).toBeInTheDocument();
  });
});

describe('ToolbarSingleTextFilter', () => {
  it('should debounce value updates', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();

    render(
      <ToolbarSingleTextFilter setValue={setValue} value="" hasKey={true} comparison="contains" />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'ab');

    await waitFor(() => {
      expect(setValue).toHaveBeenCalled();
    });

    const lastCall = setValue.mock.calls[setValue.mock.calls.length - 1][0] as string;
    expect(lastCall).toContain('b');
  });

  it('should clear both local and parent value on clear button', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();

    render(
      <ToolbarSingleTextFilter
        setValue={setValue}
        value="initial"
        hasKey={true}
        comparison="contains"
      />
    );

    const clearButton = screen.getByRole('button', { name: 'clear filter' });
    await user.click(clearButton);

    expect(setValue).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('should clear input when hasKey becomes false', () => {
    const { rerender } = render(
      <ToolbarSingleTextFilter
        setValue={vi.fn()}
        value="test"
        hasKey={true}
        comparison="contains"
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('test');

    rerender(
      <ToolbarSingleTextFilter
        setValue={vi.fn()}
        value="test"
        hasKey={false}
        comparison="contains"
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
