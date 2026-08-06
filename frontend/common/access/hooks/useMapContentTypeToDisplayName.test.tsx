/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMapContentTypeToDisplayName } from './useMapContentTypeToDisplayName';

describe('useMapContentTypeToDisplayName', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    expect(typeof result.current).toBe('function');
  });

  it('should map known content types to display names', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('activation')).toBe('rulebook activation');
    expect(getDisplayName('credential')).toBe('credential');
    expect(getDisplayName('inventory')).toBe('inventory');
    expect(getDisplayName('jobtemplate')).toBe('job template');
    expect(getDisplayName('organization')).toBe('organization');
    expect(getDisplayName('team')).toBe('team');
    expect(getDisplayName('project')).toBe('project');
  });

  it('should return title case display names when isTitleCase is true', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('activation', { isTitleCase: true })).toBe('Rulebook Activation');
    expect(getDisplayName('credential', { isTitleCase: true })).toBe('Credential');
    expect(getDisplayName('inventory', { isTitleCase: true })).toBe('Inventory');
    expect(getDisplayName('jobtemplate', { isTitleCase: true })).toBe('Job Template');
    expect(getDisplayName('organization', { isTitleCase: true })).toBe('Organization');
    expect(getDisplayName('team', { isTitleCase: true })).toBe('Team');
  });

  it('should extract short type from dotted content type', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('awx.credential')).toBe('credential');
    expect(getDisplayName('eda.activation')).toBe('rulebook activation');
    expect(getDisplayName('galaxy.namespace')).toBe('namespace');
    expect(getDisplayName('shared.organization')).toBe('organization');
  });

  it('should return the short type for unknown content types', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('unknown.foobar')).toBe('foobar');
    expect(getDisplayName('sometype')).toBe('sometype');
  });

  it('should map service prefixes to component display names', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('awx')).toBe('automation execution');
    expect(getDisplayName('eda')).toBe('automation decisions');
    expect(getDisplayName('galaxy')).toBe('automation content');
    expect(getDisplayName('shared')).toBe('multiple components');
  });

  it('should map service prefixes to title case names', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('awx', { isTitleCase: true })).toBe('Automation Execution');
    expect(getDisplayName('eda', { isTitleCase: true })).toBe('Automation Decisions');
    expect(getDisplayName('galaxy', { isTitleCase: true })).toBe('Automation Content');
    expect(getDisplayName('shared', { isTitleCase: true })).toBe('Multiple Components');
  });

  it('should handle null content type', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('null')).toBe('system');
    expect(getDisplayName('null', { isTitleCase: true })).toBe('System');
  });

  it('should map all hub-specific types', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('ansiblerepository')).toBe('repository');
    expect(getDisplayName('containernamespace')).toBe('execution environment');
    expect(getDisplayName('collectionremote')).toBe('remote');
    expect(getDisplayName('containerregistryremote')).toBe('container registry remote');
  });

  it('should map all eda-specific types', () => {
    const { result } = renderHook(() => useMapContentTypeToDisplayName());
    const getDisplayName = result.current;

    expect(getDisplayName('decisionenvironment')).toBe('decision environment');
    expect(getDisplayName('edacredential')).toBe('credential');
    expect(getDisplayName('eventstream')).toBe('event stream');
    expect(getDisplayName('rulebook')).toBe('rulebook');
    expect(getDisplayName('rulebookprocess')).toBe('rulebook process');
  });
});
