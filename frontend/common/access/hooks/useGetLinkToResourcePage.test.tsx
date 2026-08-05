/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useGetLinkToResourcePage } from './useGetLinkToResourcePage';

describe('useGetLinkToResourcePage', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('should return a function', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  it('should return undefined when contentType is null', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: null, objectId: '1' });
    expect(url).toBeUndefined();
  });

  it('should return undefined when objectId is null', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.credential', objectId: null });
    expect(url).toBeUndefined();
  });

  it('should return undefined for unknown content type', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'unknown.type', objectId: '1' });
    expect(url).toBeUndefined();
  });

  it('should return a URL for EDA credential', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.edacredential', objectId: '5' });
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
  });

  it('should return a URL for EDA project', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.project', objectId: '10' });
    expect(url).toBeDefined();
  });

  it('should return a URL for EDA activation', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.activation', objectId: '15' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX credential', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.credential', objectId: '20' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX inventory', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.inventory', objectId: '25' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX job template', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.jobtemplate', objectId: '30' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX project', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.project', objectId: '35' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX workflow job template', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.workflowjobtemplate', objectId: '40' });
    expect(url).toBeDefined();
  });

  it('should return a URL for shared team', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'shared.team', objectId: '45' });
    expect(url).toBeDefined();
  });

  it('should return a URL for shared organization', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'shared.organization', objectId: '50' });
    expect(url).toBeDefined();
  });

  it('should return a URL for galaxy namespace using name parameter', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage('my-namespace'), { wrapper });
    const url = result.current({ contentType: 'galaxy.namespace', objectId: '55' });
    expect(url).toBeDefined();
  });

  it('should return a URL for Hub repository', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'galaxy.ansiblerepository', objectId: '60' });
    expect(url).toBeDefined();
  });

  it('should return a URL for Hub execution environment', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'galaxy.containernamespace', objectId: '65' });
    expect(url).toBeDefined();
  });

  it('should return a URL for Hub collection remote', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'galaxy.collectionremote', objectId: '70' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX instance group', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.instancegroup', objectId: '75' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX notification template', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.notificationtemplate', objectId: '80' });
    expect(url).toBeDefined();
  });

  it('should return a URL for AWX execution environment', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'awx.executionenvironment', objectId: '85' });
    expect(url).toBeDefined();
  });

  it('should return a URL for EDA decision environment', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.decisionenvironment', objectId: '90' });
    expect(url).toBeDefined();
  });

  it('should return a URL for EDA audit rule', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.auditrule', objectId: '95' });
    expect(url).toBeDefined();
  });

  it('should return a URL for EDA rulebook process', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.rulebookprocess', objectId: '100' });
    expect(url).toBeDefined();
  });

  it('should return a URL for EDA credential type', () => {
    const { result } = renderHook(() => useGetLinkToResourcePage(), { wrapper });
    const url = result.current({ contentType: 'eda.credentialtype', objectId: '105' });
    expect(url).toBeDefined();
  });
});
