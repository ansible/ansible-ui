/* istanbul ignore file */

const randomCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const randomCharactersLowercase = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(
  length: number,
  base = randomCharacters.length,
  options?: {
    isLowercase: boolean;
  }
): string {
  const randomChars = options?.isLowercase ? randomCharactersLowercase : randomCharacters;
  if (base > randomChars.length || base <= 0) base = randomChars.length;
  let text = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * base) % base;
    text += randomChars.charAt(index);
  }
  return text;
}
