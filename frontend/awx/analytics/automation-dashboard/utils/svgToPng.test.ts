/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { svgToPng } from './svgToPng';

// ─── Image mocks ──────────────────────────────────────────────────────────────

class SuccessImage {
  onload: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  remove = vi.fn();
  set src(_: string) {
    void Promise.resolve().then(() => this.onload?.());
  }
}

class ErrorImage {
  onload: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  remove = vi.fn();
  set src(_: string) {
    void Promise.resolve().then(() => this.onerror?.(new Error('load failed')));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createSvg(clientWidth = 0, clientHeight = 0): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.defineProperty(svg, 'clientWidth', { get: () => clientWidth, configurable: true });
  Object.defineProperty(svg, 'clientHeight', { get: () => clientHeight, configurable: true });
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
    width: 200,
    height: 150,
    x: 0,
    y: 0,
    top: 0,
    right: 200,
    bottom: 150,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return svg;
}

const mockCtx = {
  fillStyle: '' as string,
  fillRect: vi.fn(),
  drawImage: vi.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('svgToPng', () => {
  let getContextSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('Image', SuccessImage);
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,abc');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --- Null / undefined guard ---

  test('should return null when svgElement is null', async () => {
    expect(await svgToPng(null)).toBeNull();
  });

  test('should return null when svgElement is undefined', async () => {
    expect(await svgToPng(undefined)).toBeNull();
  });

  // --- Canvas context null guard ---

  test('should return null when canvas 2d context is unavailable', async () => {
    getContextSpy.mockReturnValue(null);
    expect(await svgToPng(createSvg())).toBeNull();
  });

  // --- Image onerror ---

  test('should return null when image fails to load', async () => {
    vi.stubGlobal('Image', ErrorImage);
    expect(await svgToPng(createSvg())).toBeNull();
  });

  // --- Dimensions via getBoundingClientRect (falsy branches) ---

  test('should use getBoundingClientRect dimensions when clientWidth/clientHeight are zero', async () => {
    const result = await svgToPng(createSvg(0, 0));
    expect(result).toBe('data:image/png;base64,abc');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
  });

  // --- Dimensions via clientWidth/clientHeight (truthy branches) ---

  test('should use clientWidth and clientHeight when they are non-zero', async () => {
    const result = await svgToPng(createSvg(300, 200));
    expect(result).toBe('data:image/png;base64,abc');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 300, 200);
  });

  // --- inlineComputedStyles: if (value) truthy branch ---

  test('should inline non-empty computed style values into the clone', async () => {
    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('#ff0000'),
    } as unknown as CSSStyleDeclaration);
    const result = await svgToPng(createSvg());
    expect(result).toBe('data:image/png;base64,abc');
  });

  // --- inlineComputedStyles: child recursion with cloneChild truthy ---

  test('should recursively inline styles for nested child elements', async () => {
    const svg = createSvg();
    svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    const result = await svgToPng(svg);
    expect(result).toBe('data:image/png;base64,abc');
  });

  // --- inlineComputedStyles: cloneChild falsy branch ---

  test('should skip child inlining when clone has fewer children than original', async () => {
    const svg = createSvg();
    svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    // Return a shallow clone (no children) so clone.children[0] is undefined
    const shallowClone = svg.cloneNode(false) as SVGSVGElement; // call original BEFORE spy
    vi.spyOn(svg, 'cloneNode').mockReturnValue(shallowClone);
    const result = await svgToPng(svg);
    expect(result).toBe('data:image/png;base64,abc');
  });
});
