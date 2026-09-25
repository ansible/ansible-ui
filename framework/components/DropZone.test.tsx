import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '../PageAlertToaster';
import { DropZone } from './DropZone';

const dropHandler = vi.hoisted(() => vi.fn<(files: File[]) => void>());

vi.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => {
    dropHandler.mockImplementation(onDrop);
    return { getRootProps: () => ({}), getInputProps: () => ({ type: 'file' }) };
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

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();

    expect(() => fireEvent.change(input!, { target: { files: [] } })).not.toThrow();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('does not read an undefined file entry', () => {
    const onDrop = vi.fn();
    const { container } = render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    const input = container.querySelector('input[type="file"]');
    expect(() =>
      fireEvent.change(input!, { target: { files: [undefined] as unknown as File[] } })
    ).not.toThrow();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('ignores an undefined file entry passed to the drop handler', () => {
    const onDrop = vi.fn();
    render(
      <PageAlertToasterProvider>
        <DropZone onDrop={onDrop}>Drop a file</DropZone>
      </PageAlertToasterProvider>
    );

    expect(() => dropHandler([undefined] as unknown as File[])).not.toThrow();
    expect(onDrop).not.toHaveBeenCalled();
  });
});
