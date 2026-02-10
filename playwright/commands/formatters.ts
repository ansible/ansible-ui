export function sumLayers(layers: Array<{ size: number }>): number {
  return layers.reduce((acc, curr) => acc + curr.size, 0);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0';
  if (!+bytes) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}
