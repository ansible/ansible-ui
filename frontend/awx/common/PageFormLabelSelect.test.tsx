/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAwxGetAllPages } from './useAwxGetAllPages';
import { PageFormLabelSelect } from './PageFormLabelSelect';

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect', () => ({
  PageFormCreatableSelect: (props: {
    additionalControls?: ReactElement;
    label: string;
    labelHelp?: string;
    labelHelpTitle?: string;
    options: { label: string; value: string }[];
    placeholderText?: string;
  }) => (
    <div>
      <span>{props.label}</span>
      <span>{props.placeholderText}</span>
      <span>{props.labelHelpTitle}</span>
      <span>{props.labelHelp}</span>
      {props.additionalControls}
      <ul>
        {props.options.map((option) => (
          <li key={option.value}>{option.label}</li>
        ))}
      </ul>
    </div>
  ),
}));
vi.mock('./useAwxGetAllPages', () => ({
  useAwxGetAllPages: vi.fn(),
}));

const mockedUseAwxGetAllPages = vi.mocked(useAwxGetAllPages);

function setLabels(
  results: { name: string; organization?: number }[] | undefined,
  isLoading = false
) {
  mockedUseAwxGetAllPages.mockReturnValue({
    results,
    error: undefined,
    isLoading,
    refresh: vi.fn(),
  });
}

describe('PageFormLabelSelect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading option while labels are loading', () => {
    setLabels(undefined, true);

    render(<PageFormLabelSelect name="labels" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows all labels and the default placeholder after loading', () => {
    setLabels([{ name: 'label1' }, { name: 'label2' }]);

    render(<PageFormLabelSelect name="labels" />);

    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Select or create labels')).toBeInTheDocument();
    expect(screen.getByText('label1')).toBeInTheDocument();
    expect(screen.getByText('label2')).toBeInTheDocument();
  });

  it('filters labels by organization and forwards optional props', () => {
    setLabels([
      { name: 'organization label', organization: 7 },
      { name: 'other organization label', organization: 8 },
    ]);
    const additionalControls = <button type="button">Create label</button>;

    render(
      <PageFormLabelSelect
        name="labels"
        organizationId={7}
        placeholderText="Choose labels"
        labelHelpTitle="Label help"
        labelHelp="Labels are shared with your organization."
        additionalControls={additionalControls}
        shouldUnregister={false}
      />
    );

    expect(screen.getByText('Choose labels')).toBeInTheDocument();
    expect(screen.getByText('Label help')).toBeInTheDocument();
    expect(screen.getByText('Labels are shared with your organization.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create label' })).toBeInTheDocument();
    expect(screen.getByText('organization label')).toBeInTheDocument();
    expect(screen.queryByText('other organization label')).not.toBeInTheDocument();
  });

  it('shows no options when the loaded response has no results', () => {
    setLabels(undefined);

    render(<PageFormLabelSelect name="labels" />);

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
