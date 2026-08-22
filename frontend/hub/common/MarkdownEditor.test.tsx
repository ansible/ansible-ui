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
  test('should render markdown headings as PatternFly Title components', () => {
    renderEditor();

    const levels = [1, 2, 3, 4, 5, 6] as const;
    for (const level of levels) {
      const heading = screen.getByRole('heading', { level, name: `heading${level}` });
      expect(heading).toHaveAttribute('data-ouia-component-type', 'PF6/Title');
      expect(heading).toHaveClass('pf-v6-c-title', `pf-m-h${level}`);
    }
  });

  test('should render paragraphs, blockquotes, lists, and thematic breaks as PatternFly Content', () => {
    renderEditor();

    const paragraph = screen.getByText('paragraph text');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph).toHaveAttribute('data-ouia-component-type', 'PF6/Content');

    const quote = screen.getByText('quote text').closest('blockquote');
    expect(quote).toHaveAttribute('data-ouia-component-type', 'PF6/Content');

    const orderedItem = screen.getByText('ordered item');
    expect(orderedItem.tagName).toBe('LI');
    expect(orderedItem).toHaveAttribute('data-ouia-component-type', 'PF6/Content');
    expect(orderedItem.closest('ol')).toHaveAttribute('data-ouia-component-type', 'PF6/Content');

    const unorderedItem = screen.getByText('unordered item');
    expect(unorderedItem.tagName).toBe('LI');
    expect(unorderedItem).toHaveAttribute('data-ouia-component-type', 'PF6/Content');
    expect(unorderedItem.closest('ul')).toHaveAttribute('data-ouia-component-type', 'PF6/Content');

    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).toHaveAttribute('data-ouia-component-type', 'PF6/Content');
  });

  test('should render placeholder markdown when text is empty', () => {
    renderEditor({ text: '', placeholder: '# Placeholder heading' });

    const heading = screen.getByRole('heading', { level: 1, name: 'Placeholder heading' });
    expect(heading).toHaveAttribute('data-ouia-component-type', 'PF6/Title');
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
