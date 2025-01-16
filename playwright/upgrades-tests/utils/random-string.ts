/* istanbul ignore file */

const randomCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomCharactersLowercase = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(
  length: number,
  base = randomCharacters.length,
  options = { isLowercase: false }
): string {
  // We'll use the default for options if it's not provided, which includes isLowercase set to false
  const randomChars = options.isLowercase ? randomCharactersLowercase : randomCharacters;
  if (base > randomChars.length || base <= 0) {
    base = randomChars.length;
  }
  let text = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * base) % base;
    text += randomChars.charAt(index);
  }
  return text;
}

export function randomLowercaseString(length: number): string {
  return randomString(length, undefined, { isLowercase: true });
}
