export function createE2EName(name?: string): string {
  return `e2e${name ?? ''}` + Math.random().toString(36).substring(7);
}
