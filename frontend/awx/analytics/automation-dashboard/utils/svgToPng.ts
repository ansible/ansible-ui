// CSS properties that carry chart/SVG colors and must be inlined before serialization.
// XMLSerializer does not resolve CSS variables, so computed values must be copied explicitly.
const SVG_STYLE_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'color',
  'font-size',
  'font-family',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'visibility',
  'display',
] as const;

/**
 * Recursively copies computed (resolved) styles from every element in the original SVG
 * into its counterpart in the clone. This resolves CSS variables (e.g. PatternFly tokens)
 * so that colors are preserved when the SVG is rendered on an HTML5 Canvas.
 */
const inlineComputedStyles = (original: Element, clone: Element): void => {
  const computed = globalThis.getComputedStyle(original);
  SVG_STYLE_PROPS.forEach((prop) => {
    const value = computed.getPropertyValue(prop);
    if (value) {
      (clone as SVGElement).style.setProperty(prop, value);
    }
  });
  Array.from(original.children).forEach((child, i) => {
    const cloneChild = clone.children[i];
    if (cloneChild) inlineComputedStyles(child, cloneChild);
  });
};

/**
 * Converts an SVG element to a PNG data URL.
 *
 * Inlines computed styles before serialization so that CSS variables
 * (e.g. PatternFly color tokens) are resolved and colors appear correctly in the output.
 */
export const svgToPng = async (
  svgElement: SVGSVGElement | undefined | null
): Promise<string | null> => {
  if (!svgElement) return null;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  inlineComputedStyles(svgElement, clone);

  const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = svgData;
  }).catch(() => null);

  if (!img) return null;

  const w = svgElement.clientWidth || svgElement.getBoundingClientRect().width;
  const h = svgElement.clientHeight || svgElement.getBoundingClientRect().height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // White background so transparent SVG areas render correctly in the PDF.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const result = canvas.toDataURL('image/png', 1);
  canvas.remove();
  img.remove();
  return result;
};
