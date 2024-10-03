export function createE2EName(name?: string): string {
  const id = crypto.randomUUID().split('-')[0];
  return `E2E ${name ? name + ' ' : ''}` + id;
}

export function createE2EUsername(username?: string): string {
  const id = crypto.randomUUID().split('-')[0];
  return `E2E_${username ? username + '_' : ''}` + id;
}
