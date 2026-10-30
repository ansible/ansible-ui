import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { getScmType, ScmType } from './scm';

describe('getScmType', () => {
  it.each([
    ['git', 'Git'],
    ['svn', 'Svn'],
    ['', 'Manual'],
    ['insights', 'Insights'],
    ['archive', 'Remote archive'],
    [null, 'Unknown'],
    ['unsupported', 'Unknown'],
  ] as const)('should map scm_type %s to label %s', (scmType, expectedText) => {
    expect(getScmType(scmType).text).toBe(expectedText);
  });
});

describe('ScmType', () => {
  it('should render scm type text', () => {
    render(
      <MemoryRouter>
        <ScmType scmType="git" />
      </MemoryRouter>
    );
    expect(screen.getByText('Git')).toBeInTheDocument();
  });
});
