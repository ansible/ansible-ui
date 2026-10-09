/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { UsefulLinksFields } from './UsefulLinksFields';

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { links: [{ name: '', url: '' }] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('UsefulLinksFields', () => {
  it('renders useful links section and inputs', () => {
    render(
      <Wrapper>
        <UsefulLinksFields />
      </Wrapper>
    );

    expect(screen.getByText('Useful links')).toBeInTheDocument();
    expect(screen.getByTestId('link-text-0')).toBeInTheDocument();
    expect(screen.getByTestId('link-url-0')).toBeInTheDocument();
  });
});
