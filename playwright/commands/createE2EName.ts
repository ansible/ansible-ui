export function createE2EName(
  name?: string,
  options?: {
    noWhitespace?: boolean;
  }
): string {
  const id = crypto.randomUUID().split('-')[0];
  let randomName = `E2E ${name ? name + ' ' : ''}` + id;
  if (options?.noWhitespace) {
    randomName = randomName.replaceAll(' ', '-');
  }
  return randomName;
}

export function createE2EUsername(username?: string): string {
  const id = crypto.randomUUID().split('-')[0];
  return `E2E_${username ? username + '_' : ''}` + id;
}
