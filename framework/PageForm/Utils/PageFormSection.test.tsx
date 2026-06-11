/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PageFormSection } from './PageFormSection';

// Mock ExpandIcon
vi.mock('../../components/icons/ExpandIcon', () => ({
  ExpandIcon: ({ isExpanded, setExpanded }: { isExpanded: boolean; setExpanded: () => void }) => (
    <button onClick={setExpanded} data-testid="expand-icon">
      {isExpanded ? 'Expanded' : 'Collapsed'}
    </button>
  ),
}));

describe('PageFormSection', () => {
  test('should render without title', () => {
    render(
      <PageFormSection>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render with title', () => {
    render(
      <PageFormSection title="Test Section">
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.getByTestId('Test Section')).toBeInTheDocument();
  });

  test('should render with singleColumn prop', () => {
    render(
      <PageFormSection singleColumn>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render with isHorizontal prop', () => {
    render(
      <PageFormSection title="Test Section" isHorizontal>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render collapsed when canCollapse is true and defaultCollapsed is true', () => {
    render(
      <PageFormSection title="Test Section" canCollapse defaultCollapsed>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByTestId('expand-icon')).toBeInTheDocument();
    expect(screen.getByText('Collapsed')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render expanded when canCollapse is true and defaultCollapsed is false', () => {
    render(
      <PageFormSection title="Test Section" canCollapse defaultCollapsed={false}>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByTestId('expand-icon')).toBeInTheDocument();
    expect(screen.getByText('Expanded')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should toggle collapse state when expand icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PageFormSection title="Test Section" canCollapse defaultCollapsed>
        <div>Child content</div>
      </PageFormSection>
    );

    const expandIcon = screen.getByTestId('expand-icon');
    expect(screen.getByText('Collapsed')).toBeInTheDocument();

    await user.click(expandIcon);

    expect(screen.getByText('Expanded')).toBeInTheDocument();
  });

  test('should not show expand icon when canCollapse is false', () => {
    render(
      <PageFormSection title="Test Section" canCollapse={false}>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.queryByTestId('expand-icon')).not.toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render with title and singleColumn', () => {
    render(
      <PageFormSection title="Test Section" singleColumn>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('should render with title, isHorizontal, and canCollapse', () => {
    render(
      <PageFormSection title="Test Section" isHorizontal canCollapse>
        <div>Child content</div>
      </PageFormSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByTestId('expand-icon')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
