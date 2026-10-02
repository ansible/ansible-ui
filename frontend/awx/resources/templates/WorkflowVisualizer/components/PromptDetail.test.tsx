import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PromptDetail } from './PromptDetail';

describe('PromptDetail', () => {
  it('should render label and children', () => {
    render(<PromptDetail label="Test Label">Some value</PromptDetail>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Some value')).toBeInTheDocument();
  });

  it('should render nothing when children is null', () => {
    const { container } = render(<PromptDetail label="Label">{null}</PromptDetail>);
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when children is undefined', () => {
    const { container } = render(<PromptDetail label="Label">{undefined}</PromptDetail>);
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when children is empty string', () => {
    const { container } = render(<PromptDetail label="Label">{''}</PromptDetail>);
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when isEmpty is true', () => {
    const { container } = render(
      <PromptDetail label="Label" isEmpty>
        Has children
      </PromptDetail>
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render override tooltip when isOverridden is true', () => {
    render(
      <PromptDetail label="Field" isOverridden overriddenValue="old value">
        new value
      </PromptDetail>
    );
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('new value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clipboard' })).toBeInTheDocument();
  });

  it('should not render override tooltip when isOverridden is false', () => {
    render(
      <PromptDetail label="Field" isOverridden={false}>
        value
      </PromptDetail>
    );
    expect(screen.queryByRole('button', { name: 'Clipboard' })).not.toBeInTheDocument();
  });

  it('should render children without label when label is omitted', () => {
    render(<PromptDetail>content only</PromptDetail>);
    expect(screen.getByText('content only')).toBeInTheDocument();
  });
});
