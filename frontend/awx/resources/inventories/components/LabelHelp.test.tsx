/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LabelHelp } from './LabelHelp';

describe('LabelHelp', () => {
  test('should render JSON/YAML help for empty inventory kind', () => {
    render(<LabelHelp inventoryKind="" />);

    expect(screen.getByText(/Variables must be in JSON or YAML syntax/i)).toBeInTheDocument();
  });

  test('should render smart inventory help for smart kind', () => {
    render(<LabelHelp inventoryKind="smart" />);

    expect(
      screen.getByText(/Enter inventory variables using either JSON or YAML/i)
    ).toBeInTheDocument();
  });

  test('should render constructed inventory help for constructed kind', () => {
    render(<LabelHelp inventoryKind="constructed" />);

    expect(
      screen.getByText(/Variables used to configure the constructed inventory plugin/i)
    ).toBeInTheDocument();
  });

  test('should show JSON and YAML examples for empty inventory kind', () => {
    render(<LabelHelp inventoryKind="" />);

    expect(screen.getByText(/JSON:/)).toBeInTheDocument();
    expect(screen.getByText(/YAML:/)).toBeInTheDocument();
  });
});
