import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConditionalField } from './ConditionalField';

describe('ConditionalField', () => {
  it('should render children when isHidden is false', () => {
    render(
      <ConditionalField isHidden={false}>
        <span>visible content</span>
      </ConditionalField>
    );

    expect(screen.getByText('visible content')).toBeInTheDocument();
  });

  it('should not render children when isHidden is true', () => {
    render(
      <ConditionalField isHidden={true}>
        <span>hidden content</span>
      </ConditionalField>
    );

    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  it('should render children when isHidden defaults to false', () => {
    render(
      <ConditionalField isHidden={false}>
        <div data-testid="child-element">content</div>
      </ConditionalField>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('should render multiple children when visible', () => {
    render(
      <ConditionalField isHidden={false}>
        <span>first</span>
        <span>second</span>
      </ConditionalField>
    );

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });
});
