/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageDetailKeyValueList } from './PageDetailKeyValueList';

const entries = [
  { key: 'Host', value: 'controller.example.com' },
  { key: 'Port', value: '443' },
];

describe('PageDetailKeyValueList', () => {
  it('renders title, headers, and default value cells', () => {
    render(
      <PageDetailKeyValueList
        title="Connection"
        keyColumn="Setting"
        valueColumn="Value"
        keyValue={entries}
      />
    );

    expect(screen.getByTestId('key-value-list-title')).toHaveTextContent('Connection');
    expect(screen.getByText('Setting')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByTestId('item-key-0')).toHaveTextContent('Host');
    expect(screen.getAllByTestId('item-value')[0]).toHaveTextContent('controller.example.com');
    expect(screen.getByTestId('item-key-1')).toHaveTextContent('Port');
  });

  it('uses a custom renderValue when provided', () => {
    render(
      <PageDetailKeyValueList
        title="Secrets"
        keyColumn="Key"
        valueColumn="Secret"
        keyValue={[{ key: 'Token', value: 'abc' }]}
        renderValue={(item) => <span data-testid="masked-value">***{item.value.slice(-1)}</span>}
      />
    );

    expect(screen.getByTestId('masked-value')).toHaveTextContent('***c');
  });
});
