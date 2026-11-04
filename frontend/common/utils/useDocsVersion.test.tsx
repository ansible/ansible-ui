import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocsVersionProvider, useDocsVersion } from './useDocsVersion';

function ReadVersion() {
  const { version } = useDocsVersion();
  return <span>{version ?? 'none'}</span>;
}

describe('useDocsVersion', () => {
  it('should return undefined version outside provider', () => {
    render(<ReadVersion />);
    expect(screen.getByText('none')).toBeInTheDocument();
  });

  it('should provide version from DocsVersionProvider', () => {
    render(
      <DocsVersionProvider version="2.5">
        <ReadVersion />
      </DocsVersionProvider>
    );
    expect(screen.getByText('2.5')).toBeInTheDocument();
  });
});
