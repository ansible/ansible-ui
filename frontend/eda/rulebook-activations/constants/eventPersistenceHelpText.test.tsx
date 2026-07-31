/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getEventPersistenceHelpText } from './eventPersistenceHelpText';

describe('getEventPersistenceHelpText', () => {
  it('should return help text with three paragraphs', () => {
    const t = (key: string) => key;
    const helpText = getEventPersistenceHelpText(t);

    const { container } = render(<div>{helpText}</div>);

    // Should contain all three key messages
    expect(container).toBeInTheDocument();
    expect(container.textContent).toContain(
      'Enabling event persistence stores events so they are not lost when a rulebook activation stops or restarts.'
    );
    expect(container.textContent).toContain(
      'If using the platform-provided persistence database, the default System Ansible Rule Engine credential is selected automatically in the credential field below.'
    );
    expect(container.textContent).toContain(
      'If using an external database and no credential exists yet, create an Ansible Rule Engine credential that can reach that database first.'
    );
  });

  it('should use translation function for all text', () => {
    const translations: string[] = [];
    const mockT = (key: string) => {
      translations.push(key);
      return key;
    };

    const helpText = getEventPersistenceHelpText(mockT);
    render(<div>{helpText}</div>);

    // Should have called translation function 3 times (once per paragraph)
    expect(translations).toHaveLength(3);
  });

  it('should return ReactNode with proper structure', () => {
    const t = (key: string) => key;
    const helpText = getEventPersistenceHelpText(t);

    const { container } = render(<div>{helpText}</div>);

    // Should have p tags for paragraphs
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(3);

    // Should have br tags between paragraphs
    const breaks = container.querySelectorAll('br');
    expect(breaks).toHaveLength(2);
  });
});
