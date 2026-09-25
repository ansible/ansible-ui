import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '../PageAlertToaster';
import { DropZone } from './DropZone';

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
});
