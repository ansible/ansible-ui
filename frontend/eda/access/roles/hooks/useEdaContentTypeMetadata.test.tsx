/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEdaContentTypeMetadata } from './useEdaContentTypeMetadata';
import { EdaContentType } from './EdaContentType';
import { BrowserRouter } from 'react-router-dom';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useEdaContentTypeMetadata', () => {
  it('should return metadata for all EDA content types', () => {
    const { result } = renderHook(() => useEdaContentTypeMetadata(), { wrapper });

    expect(result.current[EdaContentType.Activation]).toBeDefined();
    expect(result.current[EdaContentType.AuditRule]).toBeDefined();
    expect(result.current[EdaContentType.Credential]).toBeDefined();
    expect(result.current[EdaContentType.DecisionEnvironment]).toBeDefined();
    expect(result.current[EdaContentType.EventStream]).toBeDefined();
    expect(result.current[EdaContentType.Project]).toBeDefined();
    expect(result.current[EdaContentType.Rulebook]).toBeDefined();
    expect(result.current[EdaContentType.RulebookProcess]).toBeDefined();
    expect(result.current[EdaContentType.Organization]).toBeDefined();
    expect(result.current[EdaContentType.Team]).toBeDefined();
  });

  it('should include apiEndpoint for each content type', () => {
    const { result } = renderHook(() => useEdaContentTypeMetadata(), { wrapper });

    expect(result.current[EdaContentType.Activation].apiEndpoint).toContain('activations');
    expect(result.current[EdaContentType.Project].apiEndpoint).toContain('projects');
    expect(result.current[EdaContentType.Credential].apiEndpoint).toContain('credentials');
    expect(result.current[EdaContentType.DecisionEnvironment].apiEndpoint).toContain(
      'decision_environments'
    );
    expect(result.current[EdaContentType.EventStream].apiEndpoint).toContain('event_streams');
    expect(result.current[EdaContentType.Rulebook].apiEndpoint).toContain('rulebooks');
    expect(result.current[EdaContentType.RulebookProcess].apiEndpoint).toContain(
      'rulebook_processes'
    );
    expect(result.current[EdaContentType.Organization].apiEndpoint).toContain('organizations');
    expect(result.current[EdaContentType.Team].apiEndpoint).toContain('teams');
  });

  it('should include detailsPageId for most content types', () => {
    const { result } = renderHook(() => useEdaContentTypeMetadata(), { wrapper });

    expect(result.current[EdaContentType.Activation].detailsPageId).toBeDefined();
    expect(result.current[EdaContentType.Project].detailsPageId).toBeDefined();
    expect(result.current[EdaContentType.Credential].detailsPageId).toBeDefined();
    expect(result.current[EdaContentType.DecisionEnvironment].detailsPageId).toBeDefined();
    expect(result.current[EdaContentType.Organization].detailsPageId).toBeDefined();
    expect(result.current[EdaContentType.Team].detailsPageId).toBeDefined();
  });

  it('should not include detailsPageId for Rulebook', () => {
    const { result } = renderHook(() => useEdaContentTypeMetadata(), { wrapper });
    expect(result.current[EdaContentType.Rulebook].detailsPageId).toBeUndefined();
  });
});
