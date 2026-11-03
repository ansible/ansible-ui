/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaSourceEventMapping } from '../interfaces/EdaSource';

const selectEventStreams = vi.fn();
vi.mock('../event-streams/hooks/useSelectEventStreams', () => ({
  useSelectEventStreams: () => selectEventStreams,
}));

import { PageFormEventSourceSelect } from './PageFormEventSourceSelect';

function renderSelect(sourceMappings: EdaSourceEventMapping[], isDisabled?: boolean) {
  const setSourceMappings = vi.fn();
  function Wrapper() {
    const methods = useForm({ defaultValues: { mappings: sourceMappings } });
    return (
      <MemoryRouter>
        <FormProvider {...methods}>
          <PageFormEventSourceSelect
            name="mappings"
            label="Event streams"
            labelHelp="help"
            labelHelpTitle="Event streams"
            rulebookId="1"
            sourceMappings={sourceMappings}
            setSourceMappings={setSourceMappings}
            placeholder="No event streams"
            selectTitle="Select event streams"
            isDisabled={isDisabled}
          />
        </FormProvider>
      </MemoryRouter>
    );
  }
  return { ...render(<Wrapper />), setSourceMappings };
}

describe('PageFormEventSourceSelect', () => {
  it('should render a placeholder when there are no mappings', () => {
    renderSelect([]);
    expect(screen.getByPlaceholderText('No event streams')).toBeDisabled();
  });

  it('should remove a mapping when a chip is closed and open the selector', async () => {
    const user = userEvent.setup();
    const { setSourceMappings } = renderSelect([
      {
        source_name: 'range',
        event_stream_id: '12',
        event_stream_name: 'GitHub',
        rulebook_hash: 'abc',
      },
    ]);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Close GitHub/i }));
    expect(setSourceMappings).toHaveBeenCalledWith([]);

    await user.click(screen.getByTestId('select-event-stream-button'));
    expect(selectEventStreams).toHaveBeenCalled();
  });

  it('should disable the selector and collapse extra chips', () => {
    const mappings = Array.from({ length: 6 }, (_, index) => ({
      source_name: `source-${index}`,
      event_stream_id: `${index}`,
      event_stream_name: `Stream ${index}`,
      rulebook_hash: 'abc',
    }));

    renderSelect(mappings, true);

    expect(screen.getByTestId('select-event-stream-button')).toBeDisabled();
    expect(screen.getByText('Stream 0')).toBeInTheDocument();
  });
});
