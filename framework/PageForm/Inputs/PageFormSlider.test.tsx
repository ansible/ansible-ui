import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormSlider } from './PageFormSlider';

type FormValues = { strength: number };

function Wrapper(
  props: Partial<React.ComponentProps<typeof PageFormSlider>> & {
    defaultValues?: FormValues;
  }
) {
  const { defaultValues = { strength: 0.5 }, ...sliderProps } = props;
  const methods = useForm<FormValues>({ defaultValues });
  return (
    <FormProvider {...methods}>
      <PageFormSlider name="strength" label="Strength" {...sliderProps} />
      <output data-testid="strength-value">{methods.watch('strength')}</output>
    </FormProvider>
  );
}

describe('PageFormSlider', () => {
  it('displays the scaled slider value for the default range', () => {
    render(<Wrapper defaultValues={{ strength: 0.5 }} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Value' })).toBeInTheDocument();
  });

  it('renders an optional value label', () => {
    render(<Wrapper valueLabel="percent" />);
    expect(screen.getByText('percent')).toBeInTheDocument();
  });

  it('uses custom min and max for display and slider bounds', () => {
    render(<Wrapper defaultValues={{ strength: 0.5 }} min={10} max={30} />);
    expect(screen.getByText('20')).toBeInTheDocument();
    const slider = screen.getByRole('slider', { name: 'Value' });
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '30');
  });

  it('stores a normalized value when the slider changes', async () => {
    const user = userEvent.setup();
    render(<Wrapper defaultValues={{ strength: 0 }} min={0} max={100} />);
    const slider = screen.getByRole('slider', { name: 'Value' });
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(Number(screen.getByTestId('strength-value').textContent)).toBeGreaterThan(0);
  });
});
