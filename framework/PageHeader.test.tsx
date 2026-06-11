/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { PageHeader } from './PageHeader';
describe('PageHeader', () => {
  test('should show header with title, description, help text and doc link', async () => {
    const { getByRole, getByText, queryByText } = render(
      <PageHeader
        title="Hello World"
        description="Demo description"
        titleHelpTitle="Demo help title"
        titleHelp="Demo help content"
        titleDocLink="https://example.com/docs"
      />
    );
    expect(getByRole('heading', { name: /^Hello World$/ })).toBeVisible();
    expect(getByText('Demo description')).toBeInTheDocument();
    expect(queryByText('Demo help title')).not.toBeInTheDocument();
    const helpButton = getByRole('button');
    await userEvent.click(helpButton);
    expect(getByRole('dialog')).toBeVisible();
    expect(getByText('Demo help title')).toBeInTheDocument();
    expect(getByText('Demo help content')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Documentation' })).toBeInTheDocument();
  });

  test('should show header with actions', () => {
    const { getByText } = render(
      <PageHeader title="Hello World" headerActions={<button>Action</button>} />
    );
    expect(getByText('Action')).toBeInTheDocument();
  });

  test('should show header with extra controls', () => {
    const { getByText } = render(
      <PageHeader title="Hello World" controls={<button>Controls</button>} />
    );
    expect(getByText('Controls')).toBeInTheDocument();
  });

  test('should show header with a footer', () => {
    const { getByText } = render(<PageHeader title="Hello World" footer={<p>Signed</p>} />);
    expect(getByText('Signed')).toBeInTheDocument();
  });
});
