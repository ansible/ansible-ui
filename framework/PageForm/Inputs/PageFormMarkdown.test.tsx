/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageFormMarkdown } from './PageFormMarkdown';

const mockWriteToClipboard = vi.hoisted(() => vi.fn());
const mockAddAlert = vi.hoisted(() => vi.fn());
const mockDownloadTextFile = vi.hoisted(() => vi.fn());

vi.mock('../..', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../..')>();
  return {
    ...actual,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

vi.mock('../../hooks/useClipboard', () => ({
  useClipboard: () => ({ writeToClipboard: mockWriteToClipboard, copySuccess: false }),
}));

vi.mock('../../utils/download-file', () => ({
  downloadTextFile: (...args: unknown[]) => {
    mockDownloadTextFile(...args);
  },
}));

vi.mock('../../components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
    setError?: (message?: string) => void;
  }) => (
    <textarea
      data-testid={props.id}
      value={props.value ?? ''}
      onChange={(event) => props.onChange?.(event.target.value)}
    />
  ),
}));

vi.mock('./PageMarkdownDetail', () => ({
  PageMarkdownDetail: ({ value }: { value?: string }) => (
    <div data-testid="markdown-preview">{value}</div>
  ),
}));

function MarkdownHarness(props?: { defaultCollapsed?: boolean }) {
  const methods = useForm({ defaultValues: { readme: '# Hello' } });
  return (
    <FormProvider {...methods}>
      <PageFormMarkdown name="readme" label="Readme" defaultCollapsed={props?.defaultCollapsed} />
    </FormProvider>
  );
}

describe('PageFormMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders markdown editor and edits content', async () => {
    const user = userEvent.setup();
    render(<MarkdownHarness />);

    const editor = screen.getByTestId('readme');
    await user.clear(editor);
    await user.type(editor, 'Updated');

    expect(editor).toHaveValue('Updated');
  });

  it('copies and downloads markdown', async () => {
    const user = userEvent.setup();
    render(<MarkdownHarness />);

    await user.click(screen.getByTestId('copy-button'));
    expect(mockWriteToClipboard).toHaveBeenCalledWith('# Hello');

    await user.click(screen.getByTestId('download-button'));
    expect(mockDownloadTextFile).toHaveBeenCalledWith('readme', '# Hello', 'md');
  });

  it('collapses the editor when defaultCollapsed is set', async () => {
    const user = userEvent.setup();
    render(<MarkdownHarness defaultCollapsed />);

    expect(screen.queryByTestId('readme')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('expandable'));
    expect(screen.getByTestId('readme')).toBeInTheDocument();
  });
});
