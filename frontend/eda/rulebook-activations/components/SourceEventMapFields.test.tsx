/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import {
  FormSingleSelectEventStream,
  FormSingleSelectSource,
  SourceEventMapFields,
} from './SourceEventMapFields';

function FormWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const methods = useForm({
    defaultValues: defaultValues ?? {
      mappings: [
        { source_name: '', event_stream_id: '', event_stream_name: '', rulebook_hash: '' },
      ],
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        <form>{children}</form>
      </FormProvider>
    </MemoryRouter>
  );
}

const mockSources: EdaSource[] = [
  { name: 'source-one', source_info: 'info for source one', rulebook_hash: 'hash1' },
  { name: 'source-two', source_info: 'info for source two', rulebook_hash: 'hash2' },
];

const mockEventStreams: EdaEventStream[] = [
  {
    id: 10,
    name: 'event-stream-one',
    test_mode: false,
  } as EdaEventStream,
  {
    id: 20,
    name: 'event-stream-two',
    test_mode: false,
  } as EdaEventStream,
];

const mockEventStreamsWithTestMode: EdaEventStream[] = [
  ...mockEventStreams,
  {
    id: 30,
    name: 'test-stream',
    test_mode: true,
  } as EdaEventStream,
];

const mockRulebook: EdaRulebook = {
  id: 1,
  name: 'test-rulebook.yml',
  organization_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  modified_at: '2023-01-01T00:00:00Z',
};

const mockMapping: EdaSourceEventMapping = {
  source_name: 'source-one',
  event_stream_id: '10',
  event_stream_name: 'event-stream-one',
  rulebook_hash: 'hash1',
};

describe('FormSingleSelectEventStream', () => {
  it('should render event stream select with label', () => {
    render(
      <FormWrapper>
        <FormSingleSelectEventStream
          name="mappings.0.event_stream_id"
          eventOptions={mockEventStreams}
          selectedEvent={0}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Event stream')).toBeInTheDocument();
  });

  it('should render options excluding test mode event streams', async () => {
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <FormSingleSelectEventStream
          name="mappings.0.event_stream_id"
          eventOptions={mockEventStreamsWithTestMode}
          selectedEvent={0}
        />
      </FormWrapper>
    );

    await user.click(screen.getByRole('button', { name: /Event stream/i }));

    expect(screen.getByText('event-stream-one')).toBeInTheDocument();
    expect(screen.getByText('event-stream-two')).toBeInTheDocument();
    expect(screen.queryByText('test-stream')).not.toBeInTheDocument();
  });

  it('should render empty options when eventOptions is undefined', () => {
    render(
      <FormWrapper>
        <FormSingleSelectEventStream
          name="mappings.0.event_stream_id"
          eventOptions={undefined}
          selectedEvent={0}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Event stream')).toBeInTheDocument();
  });
});

describe('FormSingleSelectSource', () => {
  it('should render source select with label', () => {
    render(
      <FormWrapper>
        <FormSingleSelectSource
          name="mappings.0.source_name"
          sourceOptions={mockSources}
          selectedSource=""
        />
      </FormWrapper>
    );

    expect(screen.getByText('Rulebook source')).toBeInTheDocument();
  });

  it('should render all source options when no other mappings exist', async () => {
    const user = userEvent.setup();
    render(
      <FormWrapper>
        <FormSingleSelectSource
          name="mappings.0.source_name"
          sourceOptions={mockSources}
          selectedSource=""
        />
      </FormWrapper>
    );

    await user.click(screen.getByRole('button', { name: /Rulebook source/i }));

    expect(screen.getByText('source-one')).toBeInTheDocument();
    expect(screen.getByText('source-two')).toBeInTheDocument();
  });

  it('should render empty options when sourceOptions is undefined', () => {
    render(
      <FormWrapper>
        <FormSingleSelectSource
          name="mappings.0.source_name"
          sourceOptions={undefined}
          selectedSource=""
        />
      </FormWrapper>
    );

    expect(screen.getByText('Rulebook source')).toBeInTheDocument();
  });
});

describe('SourceEventMapFields', () => {
  it('should render mapping header with correct index', () => {
    render(
      <FormWrapper>
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Mapping 1')).toBeInTheDocument();
  });

  it('should render both source and event stream selects', () => {
    render(
      <FormWrapper>
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Rulebook source')).toBeInTheDocument();
    expect(screen.getByText('Event stream')).toBeInTheDocument();
    expect(screen.getByText('Preview of source from rulebook')).toBeInTheDocument();
  });

  it('should render delete button and call onDelete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <FormWrapper>
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={onDelete}
        />
      </FormWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /Delete map/i });
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(0);
  });

  it('should handle undefined sourceOptions and eventOptions', () => {
    render(
      <FormWrapper>
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={undefined}
          eventOptions={undefined}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Mapping 1')).toBeInTheDocument();
  });

  it('should render with second index', () => {
    render(
      <FormWrapper>
        <SourceEventMapFields
          index={1}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Mapping 2')).toBeInTheDocument();
  });

  it('should set source info when source is selected', () => {
    render(
      <FormWrapper
        defaultValues={{
          mappings: [
            {
              source_name: 'source-one',
              event_stream_id: '',
              event_stream_name: '',
              rulebook_hash: '',
            },
          ],
        }}
      >
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Mapping 1')).toBeInTheDocument();
  });

  it('should set event info when event stream is selected', () => {
    render(
      <FormWrapper
        defaultValues={{
          mappings: [
            {
              source_name: '',
              event_stream_id: 10,
              event_stream_name: '',
              rulebook_hash: '',
            },
          ],
        }}
      >
        <SourceEventMapFields
          index={0}
          rulebook={mockRulebook}
          source_mappings={mockMapping}
          sourceOptions={mockSources}
          eventOptions={mockEventStreams}
          onDelete={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Mapping 1')).toBeInTheDocument();
  });
});
