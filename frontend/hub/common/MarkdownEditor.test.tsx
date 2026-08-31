import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { MarkdownEditor } from './MarkdownEditor';

const markdownWithAllBlocks = [
  '# heading1',
  '## heading2',
  '### heading3',
  '#### heading4',
  '##### heading5',
  '###### heading6',
  '',
  'paragraph text',
  '',
  '> quote text',
  '',
  '---',
  '',
  '1. ordered item',
  '',
  '- unordered item',
].join('\n');

function renderEditor({
  text = markdownWithAllBlocks,
  placeholder = '',
  updateText = vi.fn(),
  helperText = '',
  editing = false,
}: {
  text?: string;
  placeholder?: string;
  updateText?: (text: string) => void;
  helperText?: string;
  editing?: boolean;
} = {}) {
  return render(
    <MarkdownEditor
      text={text}
      placeholder={placeholder}
      updateText={updateText}
      helperText={helperText}
      editing={editing}
    />
  );
}

describe('MarkdownEditor', () => {
  test('should render markdown headings, paragraphs, lists, quotes, and thematic breaks', () => {
    renderEditor();

    const preview = screen.getByTestId('readme');
    expect(preview).toHaveAttribute('data-ouia-component-type', 'PF6/Content');

    const levels = [1, 2, 3, 4, 5, 6] as const;
    for (const level of levels) {
      const heading = screen.getByRole('heading', { level, name: `heading${level}` });
      expect(heading.tagName).toBe(`H${level}`);
      expect(preview).toContainElement(heading);
    }

    expect(screen.getByText('paragraph text').tagName).toBe('P');
    expect(screen.getByText('quote text').closest('blockquote')).toBeInTheDocument();

    const orderedItem = screen.getByText('ordered item');
    expect(orderedItem.tagName).toBe('LI');
    expect(orderedItem.closest('ol')).toBeInTheDocument();

    const unorderedItem = screen.getByText('unordered item');
    expect(unorderedItem.tagName).toBe('LI');
    expect(unorderedItem.closest('ul')).toBeInTheDocument();

    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
  });

  test('should preserve ordered list start when numbering does not begin at 1', () => {
    renderEditor({ text: '5. fifth item' });

    expect(screen.getByText('fifth item').closest('ol')).toHaveAttribute('start', '5');
  });

  test('should apply GFM task-list classes on lists and items', () => {
    renderEditor({
      text: ['- [ ] unchecked item', '- [x] checked item'].join('\n'),
    });

    const uncheckedItem = screen.getByText('unchecked item');
    const checkedItem = screen.getByText('checked item');
    const list = uncheckedItem.closest('ul');

    expect(list).toHaveClass('contains-task-list');
    expect(uncheckedItem).toHaveClass('task-list-item');
    expect(checkedItem).toHaveClass('task-list-item');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
  });

  test('should apply GFM task-list class on ordered lists that contain tasks', () => {
    renderEditor({
      text: ['3. [ ] first task', '4. [x] second task'].join('\n'),
    });

    const list = screen.getByText('first task').closest('ol');
    expect(list).toHaveAttribute('start', '3');
    expect(list).toHaveClass('contains-task-list');
    expect(screen.getByText('first task')).toHaveClass('task-list-item');
  });

  test('should render placeholder markdown when text is empty', () => {
    renderEditor({ text: '', placeholder: '# Placeholder heading' });

    expect(screen.getByRole('heading', { level: 1, name: 'Placeholder heading' }).tagName).toBe(
      'H1'
    );
  });

  test('should show the raw editor and preview while editing', async () => {
    const user = userEvent.setup();
    const updateText = vi.fn();

    renderEditor({
      text: '# heading1',
      updateText,
      helperText: 'Supports markdown',
      editing: true,
    });

    expect(screen.getByText('Raw Markdown')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Supports markdown')).toBeInTheDocument();
    expect(screen.getByTestId('readme')).toHaveClass('preview');

    const textarea = screen.getByTestId('raw-markdown');
    await user.type(textarea, 'x');

    expect(updateText).toHaveBeenCalled();
  });
});
