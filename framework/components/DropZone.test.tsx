import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('does not read when the first dropped file is unavailable', () => {
    const onDrop = vi.fn();
    render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    capturedOnDrop?.([undefined as unknown as File]);

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('reads a dropped text file through the drop handler', async () => {
    const onDrop = vi.fn();
    render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    const file = new File(['{"hello":"world"}'], 'data.json', { type: 'application/json' });
    capturedOnDrop?.([file]);

    await vi.waitFor(() => {
      expect(onDrop).toHaveBeenCalledWith('{"hello":"world"}');
    });
  });

  it('shows an alert when reading a dropped file fails', async () => {
    vi.stubGlobal(
      'FileReader',
      class {
        onerror: (() => void) | null = null;

        readAsText() {
          this.onerror?.();
        }
      }
    );

    render(
      <PageAlertToasterProvider>
        <DropZone onDrop={vi.fn()}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    capturedOnDrop?.([new File(['contents'], 'data.json')]);

    expect(await screen.findByText('Failed to upload file')).toBeInTheDocument();
    expect(screen.getByText('Unable to upload')).toBeInTheDocument();
  });
});
