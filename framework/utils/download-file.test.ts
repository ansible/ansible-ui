/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { downloadBlobFile, downloadCvsFile, downloadTextFile } from './download-file';

describe('download-file', () => {
  let createObjectUrlSpy: MockInstance;
  let revokeObjectUrlSpy: MockInstance;
  let clickSpy: MockInstance;

  beforeEach(() => {
    createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {});
  });

  afterEach(() => {
    document.body.replaceChildren();
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    clickSpy.mockRestore();
  });

  describe('downloadBlobFile', () => {
    test('should create an object URL from the blob', () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      downloadBlobFile('test-file', 'csv', blob);
      expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);
    });

    test('should append an anchor with correct href and download attribute then click it', () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      downloadBlobFile('test-file', 'csv', blob);

      expect(clickSpy).toHaveBeenCalledOnce();
      const capturedLink = clickSpy.mock.instances[0] as HTMLAnchorElement;
      expect(capturedLink.download).toBe('test-file.csv');
      expect(capturedLink.href).toContain('blob:mock-url');
    });

    test('should revoke the object URL and remove the link after click', () => {
      const blob = new Blob(['data'], { type: 'application/pdf' });
      downloadBlobFile('test-file', 'pdf', blob);

      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
      expect(document.querySelector('a[download="test-file.pdf"]')).toBeNull();
    });
  });

  describe('downloadTextFile', () => {
    test('should create a text blob and trigger download with default txt extension', () => {
      downloadTextFile('test-file', 'hello/nworld');

      expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
      const capturedLink = clickSpy.mock.instances[0] as HTMLAnchorElement;
      expect(capturedLink.download).toBe('test-file.txt');
    });

    test('should use the provided extension', () => {
      downloadTextFile('test-file', 'content', 'yaml');

      const capturedLink = clickSpy.mock.instances[0] as HTMLAnchorElement;
      expect(capturedLink.download).toBe('test-file.yaml');
    });

    test('should revoke the object URL after click', () => {
      downloadTextFile('test-file', 'content');

      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadCvsFile', () => {
    test('should create a csv blob and trigger download with csv extension', () => {
      downloadCvsFile('test-file', ['col1,col2', 'a,b']);

      expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
      const capturedLink = clickSpy.mock.instances[0] as HTMLAnchorElement;
      expect(capturedLink.download).toBe('test-file.csv');
    });

    test('should revoke the object URL after click', () => {
      downloadCvsFile('test-file', ['col1,col2']);

      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
