/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  test('should show header with title', () => {
    const { getByRole } = render(<PageHeader title="Hello World" />);
    expect(getByRole('heading', { name: /^Hello World$/ })).toBeVisible();
  });
});
