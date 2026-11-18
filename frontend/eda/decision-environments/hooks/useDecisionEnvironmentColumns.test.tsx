/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import {
  useDecisionEnvironmentColumns,
  useDecisionEnvironmentsColumns,
} from './useDecisionEnvironmentColumns';

function columnCell<T extends object>(column: ITableColumn<T>, item: T) {
  if (!('cell' in column)) {
    throw new Error(`Column "${column.header}" has no cell renderer`);
  }
  return column.cell(item);
}

const decisionEnvironment: EdaDecisionEnvironment = {
  id: 9,
  name: 'Decision Env',
  description: 'Runs rules',
  image_url: 'quay.io/example/env:latest',
  organization_id: 1,
  eda_credential_id: 12,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-02T00:00:00Z',
};

const decisionEnvironmentRead: EdaDecisionEnvironmentRead = {
  id: 9,
  name: 'Decision Env',
  description: 'Runs rules',
  image_url: 'quay.io/example/env:latest',
  organization: { id: 1, name: 'Default' },
  eda_credential: {
    id: 12,
    name: 'Registry cred',
    inputs: {},
    credential_type_id: 1,
    organization_id: 1,
  },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-02T00:00:00Z',
};

describe('useDecisionEnvironmentsColumns', () => {
  it('renders name, image, and credential cells with links enabled', () => {
    const { result } = renderHook(() => useDecisionEnvironmentsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    render(
      <MemoryRouter>
        {columnCell(result.current[0], decisionEnvironment)}
        {columnCell(result.current[2], decisionEnvironment)}
      </MemoryRouter>
    );

    expect(screen.getByText('Decision Env')).toBeInTheDocument();
    expect(screen.getByText('quay.io/example/env:latest')).toBeInTheDocument();
  });

  it('omits name links when disableLinks is true', () => {
    const { result } = renderHook(() => useDecisionEnvironmentsColumns({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current[0].header).toBe('Name');
    expect(columnCell(result.current[0], decisionEnvironment)).toBeTruthy();
  });
});

describe('useDecisionEnvironmentColumns', () => {
  it('returns column headers and value extractors for read model', () => {
    const { result } = renderHook(() => useDecisionEnvironmentColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Description',
      'Image',
      'Credential',
      'Created',
      'Last modified',
    ]);
    expect(result.current[1].value?.(decisionEnvironmentRead)).toBe('Runs rules');
    expect(result.current[4].value?.(decisionEnvironmentRead)).toBe('2024-01-01T00:00:00Z');
  });
});
