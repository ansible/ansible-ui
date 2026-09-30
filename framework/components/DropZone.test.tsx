import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '../PageAlertToaster';
import { DropZone } from './DropZone';

let capturedOnDrop: ((files: File[]) => void) | undefined;

vi.mock('react-dropzone', () => ({
  useDropzone: (options: { onDrop: (files: File[]) => void }) => {
    capturedOnDrop = options.onDrop;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({ type: 'file' }),
    };
  },
}));

describe('DropZone', () => {
  it('does not read a file when the drop contains no files', () => {
    const onDrop = vi.fn();
    const { container } = render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    capturedOnDrop?.([]);
    expect(onDrop).not.toHaveBeenCalled();

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('reads an uploaded text file', async () => {
    const onDrop = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    const file = new File(['{"hello":"world"}'], 'data.json', { type: 'application/json' });
    await user.upload(input as HTMLInputElement, file);

    await vi.waitFor(() => {
      expect(onDrop).toHaveBeenCalledWith('{"hello":"world"}');
    });
  });
});
